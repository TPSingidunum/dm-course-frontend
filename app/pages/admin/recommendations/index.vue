<!-- Offline evaluation + CTR (popular vs personalized). -->
<template>
  <AdminPage title="Recommendations">
    <template #actions>
      <UButton to="/admin/recommendations/hybrid" variant="outline">Hybrid evaluation</UButton>
    </template>

    <MlUnavailable v-if="!report && loaded" />
    <template v-if="report">
      <p class="text-sm" data-testid="eval-header">
        split {{ report.split_time }} · test cases {{ report.n_test_cases }} · test sessions {{ report.n_test_sessions }} ·
        train/test events {{ report.n_train_events }} / {{ report.n_test_events }}
      </p>
      <AdminTable :data="report.comparison" :columns="evalCols" data-testid="eval-table" />
    </template>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard v-if="ctr" data-testid="ctr-card">
        <template #header>
          <h2 class="font-semibold">CTR (impression log) — overall {{ ctr.overall.ctr }} ({{ ctr.overall.clicks }}/{{ ctr.overall.impressions }})</h2>
        </template>
        <div class="space-y-3">
          <AdminTable :data="ctr.by_algorithm.groups" :columns="ctrCols" />
          <AdminTable :data="ctr.by_position.groups" :columns="ctrCols" />
        </div>
      </UCard>
      <UCard v-if="comparison" data-testid="session-comparison">
        <template #header>
          <h2 class="font-semibold">Popular vs personalized ({{ comparison.n_sessions }} sessions, simulation)</h2>
        </template>
        <AdminTable :data="comparison.comparison" :columns="comparisonCols" />
      </UCard>
    </div>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { CtrReport, EvalReport, SessionComparison } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const report = ref<EvalReport | null>(null)
const ctr = ref<CtrReport | null>(null)
const comparison = ref<SessionComparison | null>(null)
const loaded = ref(false)

const evalCols = columnsFor(['method', 'precision_at_k', 'recall_at_k', 'hit_rate_at_k', 'ndcg_at_k', 'catalog_coverage'])
const ctrCols = columnsFor(['group', 'impressions', 'clicks', 'ctr'])
const comparisonCols = columnsFor(['algorithm', 'impressions', 'clicks', 'ctr'])

onMounted(async () => {
  [report.value, ctr.value, comparison.value] = await Promise.all([
    mlGet<EvalReport>('/analytics/recommendations'),
    mlGet<CtrReport>('/analytics/recommendations/ctr'),
    mlGet<SessionComparison>('/analytics/recommendations/session-comparison'),
  ])
  loaded.value = true
})
</script>
