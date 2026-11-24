<!-- Conversion model — training, metrics + baseline, leakage before/after, per-user prediction. -->
<template>
  <AdminPage title="Conversion model">
    <template #actions>
      <USelect v-model="modelType" :items="['logistic_regression', 'random_forest']" class="w-48" />
      <UButton :loading="busy" data-testid="train-conversion" @click="train">Train</UButton>
    </template>

    <MlUnavailable v-if="down" :retry="load" />
    <UAlert
      v-else-if="!status" color="info" variant="subtle" icon="i-lucide-info" title="Model not trained"
      description="Click “Train” to train the conversion model." data-testid="untrained" />
    <UAlert v-if="error" color="error" variant="subtle" :title="error" />

    <template v-if="status">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Model" icon="i-lucide-brain" :value="humanize(status.model_type)" :hint="`cutoff ${status.cutoff}`" />
        <StatTile label="Window" icon="i-lucide-calendar-range" :value="`${status.window_days} days`" />
        <StatTile
          label="Train / test" icon="i-lucide-split"
          :value="`${formatCell('count', status.n_train)} / ${formatCell('count', status.n_test)}`" />
        <StatTile label="Base rate" icon="i-lucide-percent" :value="formatCell('base_rate', status.base_rate)" hint="share of buyers" />
      </div>

      <AdminSection title="Model vs majority baseline" description="A model only helps if it beats always predicting “no purchase”.">
        <AdminTable :data="metricRows" :columns="metricCols" data-testid="metrics-table" />
      </AdminSection>

      <AdminSection v-if="status.metrics.confusion_matrix" title="Confusion matrix" description="Test-set predictions of the model.">
        <ConfusionMatrix :matrix="status.metrics.confusion_matrix" />
      </AdminSection>

      <AdminSection v-if="leakage" title="Leakage: clean vs leaky" description="A leaky feature inflates the metrics — compare the two runs.">
        <AdminTable :data="leakageRows" :columns="metricCols" />
      </AdminSection>
    </template>

    <AdminSection title="Per-user prediction" description="Probability that a customer purchases in the next window.">
      <UCard>
        <div class="flex flex-wrap items-center gap-3">
          <UInput v-model.number="userId" type="number" class="w-32" aria-label="User id" />
          <UButton data-testid="predict" @click="predict">Get probability</UButton>
          <UAlert v-if="predictError" color="error" variant="subtle" :title="predictError" class="flex-1" />
        </div>
        <div v-if="prediction" class="mt-5 space-y-2" data-testid="prediction">
          <div class="flex flex-wrap items-baseline gap-3">
            <span class="text-4xl font-bold">{{ formatCell('probability', prediction.probability) }}</span>
            <UBadge v-if="prediction.fallback" color="warning" variant="subtle">fallback: {{ prediction.reason }}</UBadge>
          </div>
          <UProgress :model-value="prediction.probability * 100" />
        </div>
      </UCard>
    </AdminSection>
  </AdminPage>
</template>

<script lang="ts" setup>
import { httpStatus } from '~/types/Ml'
import type { ConversionPrediction, ConversionStatus, ConversionTrainResult } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const modelType = ref('logistic_regression')
const status = ref<ConversionStatus | null>(null)
const leakage = ref<ConversionTrainResult['leakage'] | null>(null)
const busy = ref(false)
const error = ref('')
const down = ref(false)
const userId = ref(DEMO_USER_ID)
const prediction = ref<ConversionPrediction | null>(null)
const predictError = ref('')

const metricCols = columnsFor(['name', 'accuracy', 'precision', 'recall', 'f1'])
const metricRows = computed(() => status.value ? [{ name: 'Model', ...status.value.metrics }, { name: 'Majority baseline', ...status.value.baseline }] : [])
const leakageRows = computed(() => leakage.value ? [{ name: 'Clean', ...leakage.value.clean }, { name: 'Leaky', ...leakage.value.leaky }] : [])

async function load() {
  try {
    status.value = await $fetch<ConversionStatus>('/ml/models/conversion/status')
    down.value = false
  } catch (e) {
    status.value = null
    down.value = httpStatus(e) !== 503
  }
}

async function train() {
  busy.value = true
  const r = await mlPost<ConversionTrainResult>('/models/conversion/train', { model_type: modelType.value })
  busy.value = false
  error.value = r.error || ''
  if (r.data) {
    leakage.value = r.data.leakage ?? null
    await load()
  }
}

async function predict() {
  prediction.value = null
  predictError.value = ''
  try {
    prediction.value = await $fetch<ConversionPrediction>(`/ml/customers/${userId.value}/conversion-probability`)
  } catch (e) {
    predictError.value = httpStatus(e) === 503 ? 'Model not trained' : 'ML API unavailable'
  }
}

onMounted(load)
</script>
