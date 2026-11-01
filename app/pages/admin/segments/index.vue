<!-- Day 2: segmentation — training, segment profiles, manual RFM vs K-Means. -->
<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-4">
      <h1 class="text-2xl font-bold">Customer segments</h1>
      <UInput v-model.number="k" type="number" class="w-20" />
      <UButton :loading="busy" data-testid="train-segments" @click="train">Train (k={{ k }})</UButton>
    </div>
    <MlUnavailable v-if="down" />
    <UAlert
v-else-if="!meta" color="info" variant="subtle" title="Model not trained"
      description="Click “Train” (POST /ml/segments/train)." class="mb-4" data-testid="untrained" />
    <p v-if="err" class="text-error mb-2">{{ err }}</p>
    <template v-if="meta">
      <p class="mb-2 text-sm">k={{ meta.k }} · silhouette={{ meta.silhouette }} · customers={{ meta.n_customers }} · reference {{ meta.reference }}</p>
      <UTable :data="meta.segments" :columns="segCols" class="mb-6" data-testid="segments-table" />
      <template v-if="meta.comparison">
        <h2 class="text-xl font-bold mb-2">Manual RFM vs K-Means (ARI = {{ meta.comparison.ari }})</h2>
        <UTable :data="dominant" :columns="domCols" />
      </template>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { httpStatus } from '~/types/Ml'
import type { SegmentsMeta } from '~/types/Ml'

definePageMeta({ layout: 'admin' })
const k = ref(4); const meta = ref<SegmentsMeta | null>(null); const busy = ref(false); const err = ref(""); const down = ref(false)
const segCols = ['segment', 'count', 'share', 'recency_days', 'frequency', 'monetary', 'aov', 'conversion', 'profile']
  .map(x => ({ accessorKey: x, header: x }))
const domCols = ['bucket', 'cluster', 'share', 'count'].map(x => ({ accessorKey: x, header: x }))
const dominant = computed(() => Object.entries(meta.value?.comparison?.dominant_cluster || {}).map(([b, v]) => ({ bucket: b, ...v })))
async function load() {
  try { meta.value = await $fetch<SegmentsMeta>('/ml/segments'); down.value = false }
  catch (e: unknown) { meta.value = null; down.value = httpStatus(e) !== 503 }
}
async function train() {
  busy.value = true
  const r = await mlPost<SegmentsMeta>('/segments/train', { k: k.value })
  busy.value = false; err.value = r.error || ""
  if (r.data) meta.value = r.data
}
onMounted(load)
</script>
