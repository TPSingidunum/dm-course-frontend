<!-- Day 12: personalized homepage (GET /ml/platform/homepage) with a graceful fallback. -->
<template>
  <div class="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold">DM Shop</h1>
    <UCard v-if="home?.hero" data-testid="home-hero">
      <p class="text-lg">{{ home.hero.content }}</p>
      <p class="text-xs text-muted mt-2">{{ home.hero.module_class }} · {{ home.hero.source }}
        <span v-if="home.hero.fallback">(fallback: {{ home.hero.fallback_reason }})</span></p>
    </UCard>
    <p v-else-if="loaded" class="text-muted" data-testid="home-fallback">Personalization unavailable — showing the catalog.</p>
    <div v-if="home?.profile" class="flex flex-wrap gap-2 text-sm">
      <UBadge variant="subtle">user {{ home.user_id }}</UBadge>
      <UBadge variant="subtle">segment: {{ home.profile.segment?.label }}</UBadge>
      <UBadge variant="subtle">RFM: {{ home.profile.rfm?.bucket ?? '—' }}</UBadge>
      <UBadge variant="subtle">p(buy): {{ home.profile.conversion?.probability }}</UBadge>
    </div>
    <RecSection title="Recommended for you" source="platform" :items="recs" :fallback="recFallback" />
    <div class="flex flex-wrap gap-3">
      <UButton to="/shop">Shop</UButton><UButton to="/category" variant="outline">Categories</UButton>
      <UButton to="/search" variant="outline">Search</UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Rec } from '~/types/Product'
import type { Homepage } from '~/types/Ml'
const home = ref<Homepage | null>(null); const recs = ref<Rec[]>([]); const recFallback = ref(false); const loaded = ref(false)
onMounted(async () => {
  const r = await mlGet<Homepage>(`/platform/homepage?user_id=${getDemoUserId()}&session_id=${getOrGenerateSessionId()}&limit=5`)
  loaded.value = true
  if (!r) return
  home.value = r
  recs.value = enrich(r.recommendations?.recommendations, (await useCatalog()).value)
  recFallback.value = !!r.recommendations?.fallback
  loaded.value = true
})
</script>
