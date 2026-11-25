<!-- Personalized homepage (GET /ml/platform/homepage) with a graceful fallback. -->
<template>
  <StorePage title="DM Shop">
    <UCard v-if="home?.hero" data-testid="home-hero">
      <p class="text-lg">{{ home.hero.content }}</p>
      <p class="mt-2 text-xs text-muted">
        {{ home.hero.module_class }} · {{ home.hero.source }}
        <span v-if="home.hero.fallback">(fallback: {{ home.hero.fallback_reason }})</span>
      </p>
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
      <UButton to="/shop">Shop</UButton>
      <UButton to="/category" color="neutral" variant="outline">Categories</UButton>
      <UButton to="/search" color="neutral" variant="outline">Search</UButton>
    </div>
  </StorePage>
</template>

<script lang="ts" setup>
import type { Rec } from '~/types/Product'
import type { Homepage } from '~/types/Ml'

const home = ref<Homepage | null>(null)
const recs = ref<Rec[]>([])
const recFallback = ref(false)
const loaded = ref(false)

onMounted(async () => {
  const r = await mlGet<Homepage>(`/platform/homepage?user_id=${getDemoUserId()}&session_id=${getOrGenerateSessionId()}&limit=5`)
  loaded.value = true
  if (!r) return
  home.value = r
  recs.value = enrich(r.recommendations?.recommendations, (await useCatalog()).value)
  recFallback.value = !!r.recommendations?.fallback
})
</script>
