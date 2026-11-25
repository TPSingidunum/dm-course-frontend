<!-- Shop grid with Default / Personalized ordering (hybrid recommendations for the demo user). -->
<template>
  <StorePage title="Shop">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div class="flex items-center gap-2">
        <UButton :color="mode === 'default' ? 'primary' : 'neutral'" :variant="mode === 'default' ? 'solid' : 'outline'" @click="setMode('default')">Default</UButton>
        <UButton
          :color="mode === 'personalized' ? 'primary' : 'neutral'" :variant="mode === 'personalized' ? 'solid' : 'outline'" :disabled="!recIds.length"
          data-testid="personalized-toggle" @click="setMode('personalized')">Personalized</UButton>
      </div>
      <UInput v-model.number="userId" type="number" class="w-28" aria-label="User id" @change="loadRecs" />
      <span class="text-sm text-muted" data-testid="shop-status">
        <template v-if="recIds.length">user {{ userId }} · {{ recIds.length }} recommended · moved {{ moved }}</template>
        <template v-else>{{ recNote }}</template>
      </span>
    </div>

    <DbAlert v-if="error" what="Products" />

    <EmptyState v-if="!products.length && !error" icon="i-lucide-package-open" title="No products yet" description="Products you create in the admin area will show up here." />
    <ProductGrid v-else>
      <ProductCard
        v-for="product in ordered" :key="product.product_id" :product="product" cart
        :badge="isRecommended(product) ? 'For you' : 'Sale'" :badge-color="isRecommended(product) ? 'primary' : 'error'"
        @add="cart.add(product, 'shop')" />
    </ProductGrid>
  </StorePage>
</template>

<script lang="ts" setup>
import type { Product } from '~/types/Product'
import type { RecList } from '~/types/Ml'

const cart = useCart()
const { data: products, error } = await useFetch<Product[]>('/api/shop', { default: () => [] })

const mode = ref<'default' | 'personalized'>('default')
const userId = ref(DEMO_USER_ID)
const recIds = ref<number[]>([])
const recNote = ref('loading personalization…')

const isRecommended = (p: Product) => mode.value === 'personalized' && recIds.value.includes(p.product_id)

function setMode(m: 'default' | 'personalized') { mode.value = m }

async function loadRecs() {
  setDemoUserId(userId.value)
  const r = await mlGet<RecList>(`/recommendations/${userId.value}?limit=10`)
  if (!r) {
    recIds.value = []
    recNote.value = 'ML API unavailable — default order'
    mode.value = 'default'
    return
  }
  recIds.value = (r.recommendations || []).map(x => x.product_id)
  if (r.fallback) recNote.value = `fallback: ${r.fallback_reason}`
  recIds.value.forEach((id, i) => trackRecommendationImpression(id, 'hybrid', i + 1))
}

onMounted(() => {
  userId.value = getDemoUserId()
  loadRecs()
})

// Personalized mode: recommended products first (in rank order), the rest keep their order.
const ordered = computed(() => {
  if (mode.value === 'default' || !recIds.value.length) return products.value
  const rank = new Map(recIds.value.map((id, i) => [id, i]))
  const recommended = products.value.filter(p => rank.has(p.product_id)).sort((a, b) => rank.get(a.product_id)! - rank.get(b.product_id)!)
  return [...recommended, ...products.value.filter(p => !rank.has(p.product_id))]
})
const moved = computed(() => ordered.value.filter((p, i) => products.value[i]?.product_id !== p.product_id).length)
</script>
