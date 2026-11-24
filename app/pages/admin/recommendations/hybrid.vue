<!-- User-based evaluation of the hybrid pipeline vs individual sources. -->
<template>
  <AdminPage title="Hybrid recommender" back>
    <MlUnavailable v-if="!report && loaded" :retry="load" />
    <template v-if="report">
      <div class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3">
        <StatTile label="Split time" icon="i-lucide-scissors" :value="report.split_time" hint="train before, test after" />
        <StatTile label="Test users" icon="i-lucide-users" :value="formatCell('count', report.n_test_users)" />
        <StatTile label="Top-K" icon="i-lucide-list-ordered" :value="`K = ${report.k}`" />
      </div>
      <AdminSection title="Method comparison" description="Hybrid vs each individual source, evaluated per user.">
        <AdminTable :data="report.comparison" :columns="cols" data-testid="hybrid-table" />
      </AdminSection>
      <UAlert
        color="neutral" variant="subtle" icon="i-lucide-info"
        description="The merge weights (0.2/0.3/0.3/0.2) are hand-picked heuristics, not learned." />
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
