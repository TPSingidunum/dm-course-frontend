<!-- Day 8: user-based evaluation of the hybrid pipeline vs individual sources. -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Hybrid recommender (user-based evaluation)</h1>
    <MlUnavailable v-if="!rep && loaded" />
    <template v-if="rep">
      <p class="text-sm mb-2">split {{ rep.split_time }} · test users {{ rep.n_test_users }} · K={{ rep.k }}</p>
      <UTable :data="rep.comparison" :columns="cols" data-testid="hybrid-table" />
      <p class="text-xs text-muted mt-2">The merge weights (0.2/0.3/0.3/0.2) are hand-picked heuristics, not learned.</p>
    </template>
  </div>
</template>
<script lang="ts" setup>
definePageMeta({ layout: 'admin' })
const rep = ref<any>(null); const loaded = ref(false)
const cols = ['method', 'precision_at_k', 'recall_at_k', 'hit_rate_at_k', 'ndcg_at_k', 'catalog_coverage'].map(x => ({ accessorKey: x, header: x }))
onMounted(async () => {
  rep.value = await mlGet('/analytics/recommendations/hybrid')
  loaded.value = true
})
</script>
