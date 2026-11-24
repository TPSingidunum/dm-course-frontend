<!-- Offline evaluation + CTR (popular vs personalized). -->
<template>
  <AdminPage title="Recommendations">
    <template #actions>
      <UButton to="/admin/recommendations/hybrid" variant="outline" trailing-icon="i-lucide-arrow-right">Hybrid evaluation</UButton>
    </template>

    <MlUnavailable v-if="!report && loaded" :retry="load" />
    <template v-if="report">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="eval-header">
        <StatTile label="Split time" icon="i-lucide-scissors" :value="report.split_time" />
        <StatTile label="Test cases" icon="i-lucide-flask-conical" :value="formatCell('count', report.n_test_cases)" :hint="`${formatCell('count', report.n_test_sessions)} sessions`" />
        <StatTile label="Train events" icon="i-lucide-database" :value="formatCell('count', report.n_train_events)" />
        <StatTile label="Test events" icon="i-lucide-database" :value="formatCell('count', report.n_test_events)" />
      </div>
      <AdminSection title="Offline evaluation" description="Quality of each recommender on held-out events.">
        <AdminTable :data="report.comparison" :columns="evalCols" data-testid="eval-table" />
      </AdminSection>
    </template>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard v-if="ctr" data-testid="ctr-card">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold">Click-through rate</h2>
            <UBadge variant="subtle">
              overall {{ formatCell('ctr', ctr.overall.ctr) }} · {{ ctr.overall.clicks }}/{{ ctr.overall.impressions }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <AdminTable :data="ctr.by_algorithm.groups" :columns="ctrCols">
            <template #ctr-cell="{ row }"><MeterBar :value="Number(row.original.ctr)" :max="maxCtr(ctr.by_algorithm.groups)" /></template>
          </AdminTable>
          <AdminTable :data="ctr.by_position.groups" :columns="ctrCols">
            <template #ctr-cell="{ row }"><MeterBar :value="Number(row.original.ctr)" :max="maxCtr(ctr.by_position.groups)" /></template>
          </AdminTable>
        </div>
      </UCard>

      <UCard v-if="comparison" data-testid="session-comparison">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold">Popular vs personalized</h2>
            <UBadge variant="subtle" color="neutral">{{ comparison.n_sessions }} sessions · simulation</UBadge>
          </div>
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

const maxCtr = (groups: { ctr: number }[]) => Math.max(...groups.map(g => Number(g.ctr)), 0.0001)

async function load() {
  [report.value, ctr.value, comparison.value] = await Promise.all([
    mlGet<EvalReport>('/analytics/recommendations'),
    mlGet<CtrReport>('/analytics/recommendations/ctr'),
    mlGet<SessionComparison>('/analytics/recommendations/session-comparison'),
  ])
  loaded.value = true
}

onMounted(load)
</script>
