<!-- Conversion model — training, metrics + baseline, leakage before/after, per-user prediction. -->
<template>
  <AdminPage title="Conversion model">
    <template #actions>
      <USelect v-model="modelType" :items="['logistic_regression', 'random_forest']" class="w-48" />
      <UButton :loading="busy" data-testid="train-conversion" @click="train">Train</UButton>
    </template>

    <MlUnavailable v-if="down" />
    <UAlert
      v-else-if="!status" color="info" variant="subtle" title="Model not trained"
      description="Click “Train” to train the conversion model." data-testid="untrained" />
    <UAlert v-if="error" color="error" variant="subtle" :title="error" />

    <template v-if="status">
      <p class="text-sm">
        {{ status.model_type }} · window {{ status.window_days }} d · cutoff {{ status.cutoff }} ·
        train {{ status.n_train }} / test {{ status.n_test }} · base rate {{ status.base_rate }}
      </p>
      <AdminTable :data="metricRows" :columns="metricCols" data-testid="metrics-table" />
      <p class="text-sm">Confusion matrix (model): {{ status.metrics.confusion_matrix }}</p>
      <template v-if="leakage">
        <h2 class="text-xl font-bold">Leakage: clean vs leaky</h2>
        <AdminTable :data="leakageRows" :columns="metricCols" />
      </template>
    </template>

    <h2 class="text-xl font-bold">Per-user prediction</h2>
    <div class="flex flex-wrap items-center gap-2">
      <UInput v-model.number="userId" type="number" class="w-32" aria-label="User id" />
      <UButton data-testid="predict" @click="predict">Get probability</UButton>
      <span v-if="prediction" data-testid="prediction">
        p = {{ prediction.probability }}
        <UBadge v-if="prediction.fallback" color="warning">fallback: {{ prediction.reason }}</UBadge>
      </span>
      <span v-if="predictError" class="text-error">{{ predictError }}</span>
    </div>
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
const metricRows = computed(() => status.value ? [{ name: 'model', ...status.value.metrics }, { name: 'majority baseline', ...status.value.baseline }] : [])
const leakageRows = computed(() => leakage.value ? [{ name: 'clean', ...leakage.value.clean }, { name: 'leaky', ...leakage.value.leaky }] : [])

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
    predictError.value = httpStatus(e) === 503 ? 'model not trained' : 'ML API unavailable'
  }
}

onMounted(load)
</script>
