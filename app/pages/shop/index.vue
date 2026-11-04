<!-- Day 8: shop grid with Default / Personalized ordering (hybrid recommendations for the demo user). -->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div class="flex flex-col items-start gap-3 pb-5 sm:flex-row sm:flex-wrap sm:items-center">
      <h1 class="text-2xl font-bold">Shop</h1>
      <div class="flex items-center gap-2">
        <UButton :variant="mode === 'default' ? 'solid' : 'outline'" @click="mode = 'default'">Default</UButton>
        <UButton
:variant="mode === 'personalized' ? 'solid' : 'outline'" :disabled="!recIds.length"
          data-testid="personalized-toggle" @click="mode = 'personalized'">Personalized</UButton>
      </div>
      <UInput v-model.number="userId" type="number" class="w-28" @change="loadRecs" />
      <span class="text-sm text-muted" data-testid="shop-status">
        <template v-if="recIds.length">user {{ userId }} · {{ recIds.length }} recommended · moved {{ moved }}</template>
        <template v-else>{{ recNote }}</template>
      </span>
    </div>
    <UAlert v-if="productError" color="error" variant="subtle" class="mb-5"
      title="Products are unavailable" description="The database is not reachable. Start the local database and refresh this page." />
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <UCard v-for="product in ordered" :key="product.product_id">
        <template #header>
          <UBadge v-if="mode === 'personalized' && recIds.includes(product.product_id)" color="primary">For you</UBadge>
          <UBadge v-else variant="subtle">Sale</UBadge>
        </template>
        <NuxtLink :to="`/product/${product.slug}`">
          <NuxtImg class="aspect-[4/3] w-full rounded-md object-cover" :src="product.img_url" />
          <p class="text-lg font-bold pt-4">{{ product.name }}</p>
          <p class="text-gray-600 text-sm">{{ product.description.substring(0, 40) }}</p>
        </NuxtLink>
        <template #footer>
          <div class="flex items-center justify-between">
            <p class="text-xl font-bold">{{ formatPrice(product.price) }}</p>
            <UButton class="cursor-pointer" icon="i-lucide-shopping-cart" @click="addToShoppingCart(product)" />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Product } from '~/types/Product';
import type { RecList } from '~/types/Ml';

const toast = useToast()
const { data: productData, error: productError } = await useFetch<Product[]>('/api/shop', {
  default: () => []
})
const products = computed(() => productData.value ?? [])
const mode = ref<'default' | 'personalized'>('default')
const userId = ref(DEMO_USER_ID)
const recIds = ref<number[]>([])
const recNote = ref("loading personalization…")

async function loadRecs() {
  setDemoUserId(userId.value)
  const r = await mlGet<RecList>(`/recommendations/${userId.value}?limit=10`)
  if (!r) { recIds.value = []; recNote.value = "ML API unavailable — default order"; mode.value = 'default'; return }
  recIds.value = (r.recommendations || []).map(x => x.product_id)
  if (r.fallback) recNote.value = `fallback: ${r.fallback_reason}`
  recIds.value.forEach((id, i) => trackRecommendationImpression(id, "hybrid", i + 1))
}
onMounted(async () => { userId.value = getDemoUserId(); await loadRecs() })

const ordered = computed(() => {
  if (mode.value === 'default' || !recIds.value.length) return products.value
  const pos = new Map(recIds.value.map((id, i) => [id, i]))
  const rec = products.value.filter(p => pos.has(p.product_id)).sort((a, b) => pos.get(a.product_id)! - pos.get(b.product_id)!)
  return [...rec, ...products.value.filter(p => !pos.has(p.product_id))]
})
const moved = computed(() => ordered.value.filter((p, i) => products.value[i]?.product_id !== p.product_id).length)

async function addToShoppingCart(p: Product) {
  const ev = { product_id: p.product_id, price: p.price, category_id: p.category_id }
  await trackProductView(ev, "shop")
  if (await addToShoppingCartEvent(ev, 1, "shop")) toast.add({ title: 'Added to shopping cart', description: p.name })
}
</script>
