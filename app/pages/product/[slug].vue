<template>
  <StorePage back>
    <div class="grid gap-8 lg:grid-cols-3">
      <div class="min-w-0 space-y-6 lg:col-span-2">
        <div class="aspect-[4/3] w-full overflow-hidden rounded-lg bg-elevated">
          <NuxtImg :src="data.img_url" :alt="data.name" class="size-full object-contain" />
        </div>
        <p class="text-muted">{{ data.description }}</p>

        <!-- Platform section (AI description with fallback + module_class) -->
        <UCard v-if="platform" data-testid="platform-section">
          <p class="mb-1 text-sm text-muted">
            Platform · {{ platform.ai_description?.source }}
            <span v-if="platform.ai_description?.fallback">(fallback: {{ platform.ai_description?.fallback_reason }})</span>
          </p>
          <p>{{ platform.ai_description?.content }}</p>
        </UCard>
      </div>

      <aside class="min-w-0">
        <div class="space-y-4 rounded-lg border border-default p-5 lg:sticky lg:top-20">
          <UBadge color="error">Sale</UBadge>
          <h1 class="text-2xl font-bold" data-testid="product-name">{{ data.name }}</h1>
          <p class="text-2xl font-bold" data-testid="product-price">{{ formatPrice(data.price) }}</p>
          <div class="flex flex-col gap-2">
            <UButton block @click="addToCart">Add to cart</UButton>
            <UButton v-if="inCart" block variant="ghost" @click="removeFromCart">Remove from cart</UButton>
            <UButton block variant="outline" @click="buy">Buy</UButton>
          </div>
        </div>
      </aside>
    </div>

    <RecSection
      v-for="s in sections" :key="s.source" :title="s.title" :source="s.source" :items="s.items"
      :fallback="s.fallback" :note="s.fallback ? s.note : ''" />
  </StorePage>
</template>

<script lang="ts" setup>
import type { Product, Rec } from '~/types/Product'
import type { ProductPlatform, RecList } from '~/types/Ml'

const route = useRoute()
const toast = useToast()
const slug = route.params.slug

const { data: fetched, error } = await useFetch<Product>(`/api/product/${slug}`)
if (!fetched.value) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: error.value?.statusMessage || 'Product not found'
  })
}
const data: Product = fetched.value

const eventProduct = { product_id: data.product_id, price: data.price, category_id: data.category_id }
const inCart = ref(false)
const platform = ref<ProductPlatform | null>(null)

// Every recommendation section is independent: if one module fails, the others are still shown.
const sections = reactive([
  { title: 'Recommended Products', source: 'content', path: `/recommendations/content/${data.product_id}`, items: [] as Rec[], fallback: false, note: '' },
  { title: 'Customers Also Viewed', source: 'collaborative', path: `/recommendations/collaborative/${data.product_id}`, items: [] as Rec[], fallback: false, note: '' },
  { title: 'Based on your session', source: 'session', path: '', items: [] as Rec[], fallback: false, note: 'not enough signals in the session' },
  { title: 'Semantically similar', source: 'semantic', path: `/recommendations/semantic/${data.product_id}`, items: [] as Rec[], fallback: false, note: '' },
])

// Where the visitor came from, for the product_view event.
function viewSource() {
  const from: string = history.state?.back || ''
  if (from.startsWith('/category')) return 'category_page'
  if (from.startsWith('/shop')) return 'shop'
  if (from.startsWith('/search')) return 'search_page'
  return 'product_page'
}

onMounted(async () => {
  await trackProductView(eventProduct, viewSource())
  const catalog = (await useCatalog()).value
  sections[2]!.path = `/recommendations/session/${getOrGenerateSessionId()}`
  await Promise.all([
    ...sections.map(async (s) => {
      const r = await mlGet<RecList>(`${s.path}?limit=5`)
      if (!r) return
      s.items = enrich(r.recommendations, catalog)
      s.fallback = !!r.fallback
    }),
    mlGet<ProductPlatform>(`/platform/product/${data.product_id}`).then((p) => { platform.value = p }),
  ])
})

useSeoMeta({
  title: data.seo?.title,
  ogTitle: data.seo?.title,
  description: data.seo?.description,
  ogDescription: data.seo?.description,
  ogImage: data.img_url,
  ogUrl: 'http://localhost:3000/product/' + slug,
  twitterCard: 'summary_large_image',
})
useHead({ htmlAttrs: { lang: 'en' }, meta: [{ name: 'keywords', content: (data.seo?.key_words || []).join(', ') }] })

async function addToCart() {
  if (await addToShoppingCartEvent(eventProduct)) {
    inCart.value = true
    toast.add({ title: 'Added to shopping cart', description: data.name, icon: 'i-lucide-shopping-cart' })
  }
}
async function removeFromCart() {
  if (await removeFromCartEvent(eventProduct)) {
    inCart.value = false
    toast.add({ title: 'Removed from cart', description: data.name })
  }
}
async function buy() {
  if (await buyProductEvent(eventProduct)) {
    inCart.value = false
    toast.add({ title: 'Purchase recorded', description: data.name, icon: 'i-lucide-check' })
  }
}
</script>
