<!-- Day 10: semantic search (GET /ml/search/semantic?q=...) -->
<template>
  <div class="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold">Search</h1>
    <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="search">
      <UInput v-model="q" placeholder="e.g. wireless earbuds for travel" class="w-full sm:max-w-xl" data-testid="search-input" />
      <UButton type="submit">Search</UButton>
    </form>
    <div v-if="res" class="flex flex-wrap gap-2" data-testid="search-meta">
      <UBadge variant="subtle">{{ res.method }}</UBadge>
      <UBadge v-if="embedder" variant="subtle">{{ embedder }}</UBadge>
      <UBadge v-if="res.fallback" color="warning">fallback: {{ res.fallback_reason }}</UBadge>
    </div>
    <p v-if="error" class="text-error">{{ error }}</p>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <UCard v-for="(r, i) in results" :key="r.product_id">
        <NuxtLink :to="`/product/${r.slug}`" @click="trackRecommendationClick(r.product_id, 'semantic', i + 1)">
          <NuxtImg class="aspect-[4/3] w-full rounded-md object-cover" :src="r.img_url" />
          <p class="font-bold mt-2 text-sm">{{ r.name }}</p>
          <p class="text-xs text-muted">score {{ r.score }}</p>
          <p class="font-bold">{{ formatPrice(r.price) }}</p>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Rec } from '~/types/Product'
import type { SemanticSearch } from '~/types/Ml'
const route = useRoute()
const q = ref(String(route.query.q || ""))
const res = ref<SemanticSearch | null>(null); const error = ref(""); const results = ref<Rec[]>([]); const embedder = ref("")
async function search() {
  if (!q.value.trim()) return
  await trackSearchEvent()
  const r = await mlGet<SemanticSearch>(`/search/semantic?q=${encodeURIComponent(q.value)}&limit=10`)
  if (!r) { error.value = "ML API unavailable — search is currently not working"; results.value = []; return }
  error.value = ""; res.value = r; results.value = enrich(r.results, (await useCatalog()).value)
  embedder.value = r.embedder || ""
}
onMounted(() => { if (q.value) search() })
</script>
