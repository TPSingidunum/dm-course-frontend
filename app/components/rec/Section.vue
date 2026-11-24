<!-- Recommendation section: logs impressions (once) and clicks with recommendation_source + position. -->
<template>
  <section v-if="items.length" class="space-y-4" :data-testid="`rec-${source}`">
    <div class="flex flex-wrap items-center gap-2">
      <h2 class="text-xl font-bold sm:text-2xl">{{ title }}</h2>
      <UBadge variant="subtle">{{ source }}</UBadge>
      <UBadge v-if="fallback" color="warning" variant="subtle">showing popularity fallback</UBadge>
      <span v-if="note" class="text-sm text-muted">{{ note }}</span>
    </div>
    <ProductGrid>
      <ProductCard
        v-for="(rec, i) in items" :key="rec.product_id" :product="rec"
        @open="trackRecommendationClick(rec.product_id, source, i + 1)" />
    </ProductGrid>
  </section>
</template>

<script lang="ts" setup>
import type { Rec } from '~/types/Product'

const props = defineProps<{ title: string, source: string, items: Rec[], fallback?: boolean, note?: string }>()

watch(() => props.items, (items) => {
  items.forEach((r, i) => trackRecommendationImpression(r.product_id, props.source, i + 1))
}, { immediate: true })
</script>
