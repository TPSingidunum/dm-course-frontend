<!-- Semantic search (GET /ml/search/semantic?q=...) -->
<template>
  <StorePage title="Search">
    <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="search">
      <UInput v-model="q" placeholder="e.g. wireless earbuds for travel" class="w-full sm:max-w-xl" data-testid="search-input" />
      <UButton type="submit">Search</UButton>
    </form>

    <div v-if="res" class="flex flex-wrap gap-2" data-testid="search-meta">
      <UBadge variant="subtle">{{ res.method }}</UBadge>
      <UBadge v-if="res.embedder" variant="subtle">{{ res.embedder }}</UBadge>
      <UBadge v-if="res.fallback" color="warning">fallback: {{ res.fallback_reason }}</UBadge>
    </div>
    <UAlert v-if="error" color="error" variant="subtle" :title="error" />

    <EmptyState v-if="res && !results.length && !error" icon="i-lucide-search-x" title="No results" description="Try describing the product in different words." />
    <ProductGrid v-else>
      <ProductCard
        v-for="(r, i) in results" :key="r.product_id" :product="r" :meta="`score ${r.score}`"
        @open="trackRecommendationClick(r.product_id, 'semantic', i + 1)" />
    </ProductGrid>
  </StorePage>
</template>

<script lang="ts" setup>
import type { Rec } from '~/types/Product'
import type { SemanticSearch } from '~/types/Ml'

const route = useRoute()
const q = ref(String(route.query.q || ''))
const res = ref<SemanticSearch | null>(null)
const results = ref<Rec[]>([])
const error = ref('')

async function search() {
  if (!q.value.trim()) return
  await trackSearchEvent()
  const r = await mlGet<SemanticSearch>(`/search/semantic?q=${encodeURIComponent(q.value)}&limit=10`)
  if (!r) {
    error.value = 'ML API unavailable — search is currently not working'
    results.value = []
    return
  }
  error.value = ''
  res.value = r
  results.value = enrich(r.results, (await useCatalog()).value)
}

onMounted(() => { if (q.value) search() })
watch(() => route.query.q, (v) => {
  q.value = String(v || '')
  if (q.value.trim()) search()
})
</script>
