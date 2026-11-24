<!-- Segmentation — training, segment profiles, manual RFM vs K-Means. -->
<template>
  <AdminPage title="Customer segments">
    <template #actions>
      <UInput v-model.number="k" type="number" class="w-20" aria-label="Number of clusters" />
      <UButton :loading="busy" data-testid="train-segments" @click="train">Train (k={{ k }})</UButton>
    </template>

    <MlUnavailable v-if="down" />
    <UAlert
      v-else-if="!meta" color="info" variant="subtle" title="Model not trained"
      description="Click “Train” to train the segmentation model." data-testid="untrained" />
    <UAlert v-if="error" color="error" variant="subtle" :title="error" />

    <template v-if="meta">
      <p class="text-sm">k={{ meta.k }} · silhouette={{ meta.silhouette }} · customers={{ meta.n_customers }} · reference {{ meta.reference }}</p>
      <AdminTable :data="meta.segments" :columns="segmentCols" data-testid="segments-table" />
      <template v-if="meta.comparison">
        <h2 class="text-xl font-bold">Manual RFM vs K-Means (ARI = {{ meta.comparison.ari }})</h2>
        <AdminTable :data="dominant" :columns="dominantCols" />
      </template>
    </template>
  </AdminPage>
</template>

<script lang="ts" setup>
import { httpStatus } from '~/types/Ml'
import type { SegmentsMeta } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const k = ref(4)
const meta = ref<SegmentsMeta | null>(null)
const busy = ref(false)
const error = ref('')
const down = ref(false)

const segmentCols = columnsFor(['segment', 'count', 'share', 'recency_days', 'frequency', 'monetary', 'aov', 'conversion', 'profile'])
const dominantCols = columnsFor(['bucket', 'cluster', 'share', 'count'])
const dominant = computed(() => Object.entries(meta.value?.comparison?.dominant_cluster || {}).map(([bucket, v]) => ({ bucket, ...v })))

async function load() {
  try {
    meta.value = await $fetch<SegmentsMeta>('/ml/segments')
    down.value = false
  } catch (e) {
    meta.value = null
    down.value = httpStatus(e) !== 503
  }
}

async function train() {
  busy.value = true
  const r = await mlPost<SegmentsMeta>('/segments/train', { k: k.value })
  busy.value = false
  error.value = r.error || ''
  if (r.data) meta.value = r.data
}

onMounted(load)
</script>
