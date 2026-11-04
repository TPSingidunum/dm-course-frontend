<!-- Day 7 (offline evaluation) + Day 9 (CTR, popular vs personalized). -->
<template>
  <div class="min-w-0 p-4 sm:p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <h1 class="text-2xl font-bold">Recommendations</h1>
      <UButton to="/admin/recommendations/hybrid" variant="outline">Hybrid (Day 8)</UButton>
    </div>
    <MlUnavailable v-if="!report && loaded" />
    <template v-if="report">
      <p class="text-sm mb-2" data-testid="eval-header">split {{ report.split_time }} · test cases {{ report.n_test_cases }} ·
        test sessions {{ report.n_test_sessions }} · train/test events {{ report.n_train_events }} / {{ report.n_test_events }}</p>
      <UTable :data="report.comparison" :columns="cols" class="mb-6" data-testid="eval-table" />
    </template>
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
      <UCard v-if="ctr" data-testid="ctr-card">
        <template #header>CTR (impression log) — overall {{ ctr.overall.ctr }} ({{ ctr.overall.clicks }}/{{ ctr.overall.impressions }})</template>
        <UTable :data="ctr.by_algorithm.groups" :columns="ctrCols" class="mb-2" />
        <UTable :data="ctr.by_position.groups" :columns="ctrCols" />
      </UCard>
      <UCard v-if="cmp" data-testid="session-comparison">
        <template #header>Popular vs personalized ({{ cmp.n_sessions }} sessions, simulation)</template>
        <UTable :data="cmp.comparison" :columns="cmpCols" />
      </UCard>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { CtrReport, EvalReport, SessionComparison } from '~/types/Ml'

definePageMeta({ layout: 'admin' })
const report = ref<EvalReport | null>(null); const ctr = ref<CtrReport | null>(null); const cmp = ref<SessionComparison | null>(null); const loaded = ref(false)
const cols = ['method', 'precision_at_k', 'recall_at_k', 'hit_rate_at_k', 'ndcg_at_k', 'catalog_coverage'].map(x => ({ accessorKey: x, header: x }))
const ctrCols = ['group', 'impressions', 'clicks', 'ctr'].map(x => ({ accessorKey: x, header: x }))
const cmpCols = ['algorithm', 'impressions', 'clicks', 'ctr'].map(x => ({ accessorKey: x, header: x }))
onMounted(async () => {
  await Promise.all([loadEval(), loadCtr()])
  loaded.value = true
})
async function loadEval() {
  report.value = await mlGet<EvalReport>('/analytics/recommendations')
}
async function loadCtr() {
  ;[ctr.value, cmp.value] = await Promise.all([mlGet<CtrReport>('/analytics/recommendations/ctr'),
    mlGet<SessionComparison>('/analytics/recommendations/session-comparison')])
}
</script>
