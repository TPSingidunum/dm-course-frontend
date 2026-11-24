<!-- Segmentation — training, segment profiles, manual RFM vs K-Means. -->
<template>
  <AdminPage title="Customer segments">
    <template #actions>
      <UInput v-model.number="k" type="number" :min="2" :max="10" class="w-20" aria-label="Number of clusters" />
      <UButton :loading="busy" data-testid="train-segments" @click="train">Train (k={{ k }})</UButton>
    </template>

    <MlUnavailable v-if="down" :retry="load" />
    <UAlert
      v-else-if="!meta" color="info" variant="subtle" icon="i-lucide-info" title="Model not trained"
      description="Click “Train” to train the segmentation model." data-testid="untrained" />
    <UAlert v-if="error" color="error" variant="subtle" :title="error" />

    <template v-if="meta">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Clusters (k)" icon="i-lucide-boxes" :value="meta.k" />
        <StatTile label="Silhouette" icon="i-lucide-scan-search" :value="meta.silhouette" hint="closer to 1 is better" />
        <StatTile label="Customers" icon="i-lucide-users" :value="formatCell('count', meta.n_customers)" />
        <StatTile label="Reference date" icon="i-lucide-calendar" :value="meta.reference" />
      </div>

      <AdminSection title="Segment profiles" description="Average behaviour of each cluster.">
        <AdminTable :data="meta.segments" :columns="segmentCols" data-testid="segments-table">
          <template #share-cell="{ row }"><MeterBar :value="Number(row.original.share)" /></template>
          <template #segment-cell="{ row }"><span class="font-medium text-highlighted">{{ row.original.segment }}</span></template>
        </AdminTable>
      </AdminSection>

      <AdminSection
        v-if="meta.comparison" title="Manual RFM vs K-Means"
        description="Which cluster dominates each manual RFM bucket.">
        <template #actions>
          <UBadge variant="subtle">ARI = {{ meta.comparison.ari }}</UBadge>
        </template>
        <AdminTable :data="dominant" :columns="dominantCols">
          <template #share-cell="{ row }"><MeterBar :value="Number(row.original.share)" /></template>
        </AdminTable>
      </AdminSection>
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
