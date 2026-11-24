<!-- User-based evaluation of the hybrid pipeline vs individual sources. -->
<template>
  <AdminPage title="Hybrid recommender" back>
    <MlUnavailable v-if="!report && loaded" :retry="load" />
    <template v-if="report">
      <p class="text-sm">split {{ report.split_time }} · test users {{ report.n_test_users }} · K={{ report.k }}</p>
      <AdminTable :data="report.comparison" :columns="cols" data-testid="hybrid-table" />
      <p class="text-xs text-muted">The merge weights (0.2/0.3/0.3/0.2) are hand-picked heuristics, not learned.</p>
    </template>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { EvalReport } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const report = ref<EvalReport | null>(null)
const loaded = ref(false)
const cols = columnsFor(['method', 'precision_at_k', 'recall_at_k', 'hit_rate_at_k', 'ndcg_at_k', 'catalog_coverage'])

async function load() {
  report.value = await mlGet<EvalReport>('/analytics/recommendations/hybrid')
  loaded.value = true
}

onMounted(load)
</script>
