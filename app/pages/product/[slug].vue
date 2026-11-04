<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
    <div class="pb-4">
      <UButton icon="i-lucide-arrow-left-to-line" aria-label="Go back" @click="router.back" />
    </div>
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="min-w-0 space-y-6 lg:col-span-2">
        <NuxtImg class="mx-auto aspect-[4/3] w-full max-w-3xl rounded-lg object-cover" :src="data.img_url" />
        <p>{{ data.description }}</p>

        <!-- Day 12: Platform section (AI description with fallback + module_class) -->
        <UCard v-if="platform" data-testid="platform-section">
          <p class="text-sm text-muted">Platform · {{ platform.ai_description?.source }}
            <span v-if="platform.ai_description?.fallback">(fallback: {{ platform.ai_description?.fallback_reason }})</span></p>
          <p>{{ platform.ai_description?.content }}</p>
        </UCard>

        <RecSection title="Recommended Products" source="content" :items="content" :fallback="contentFallback" />
        <RecSection title="Customers Also Viewed" source="collaborative" :items="collab" :fallback="collabFallback" />
        <RecSection
          title="Based on your session" source="session" :items="session" :fallback="sessionFallback"
          :note="sessionFallback ? 'not enough signals in the session' : ''" />
        <RecSection title="Semantically similar" source="semantic" :items="semantic" />
      </div>
      <aside class="min-w-0">
        <div class="space-y-4 rounded-lg border border-default p-5 lg:sticky lg:top-4">
          <UBadge color="error">Sale</UBadge>
          <p class="text-2xl font-bold" data-testid="product-name">{{ data.name }}</p>
          <p class="text-2xl font-bold" data-testid="product-price">{{ formatPrice(data.price) }}</p>
          <UButton class="w-full cursor-pointer" @click="addToCart">Add to cart</UButton>
          <UButton v-if="inCart" variant="ghost" class="w-full cursor-pointer" @click="removeFromCart">Remove from cart</UButton>
          <UButton variant="outline" class="w-full cursor-pointer" @click="buy">Buy</UButton>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Product, Rec } from '~/types/Product';
import type { ProductPlatform, RecList } from '~/types/Ml';

const router = useRouter()
const route = useRoute()
const toast = useToast()
const slug = route.params.slug;

const { data: productData, error: productError } = await useFetch<Product>(`/api/product/${slug}`)
const data = productData.value!
if (!data) {
  throw createError({
    statusCode: productError.value?.statusCode || 404,
    statusMessage: productError.value?.statusMessage || 'Product not found'
  })
}

const content = ref<Rec[]>([]); const contentFallback = ref(false)
const collab = ref<Rec[]>([]); const collabFallback = ref(false)
const session = ref<Rec[]>([]); const sessionFallback = ref(false)
const semantic = ref<Rec[]>([])
const platform = ref<ProductPlatform | null>(null)
const inCart = ref(false)
const P = () => ({ product_id: data.product_id, price: data.price, category_id: data.category_id })

onMounted(async () => {
  const src = (history.state?.back || "").startsWith("/category") ? "category_page"
            : (history.state?.back || "").startsWith("/shop") ? "shop"
            : (history.state?.back || "").startsWith("/search") ? "search_page" : "product_page"
  await trackProductView(P(), src)
  const cat = (await useCatalog()).value
  // each section is independent: if one module fails, the others are still shown
  await Promise.all([loadContent(cat), loadCollab(cat), loadSession(cat), loadSemantic(cat), loadPlatform()])
})

async function loadContent(cat: Record<number, Product>) {
  const c = await mlGet<RecList>(`/recommendations/content/${data.product_id}?limit=5`)
  if (c) { content.value = enrich(c.recommendations, cat); contentFallback.value = !!c.fallback }
}
async function loadCollab(cat: Record<number, Product>) {
  const cf = await mlGet<RecList>(`/recommendations/collaborative/${data.product_id}?limit=5`)
  if (cf) { collab.value = enrich(cf.recommendations, cat); collabFallback.value = !!cf.fallback }
}
async function loadSession(cat: Record<number, Product>) {
  const se = await mlGet<RecList>(`/recommendations/session/${getOrGenerateSessionId()}?limit=5`)
  if (se) { session.value = enrich(se.recommendations, cat); sessionFallback.value = !!se.fallback }
}
async function loadSemantic(cat: Record<number, Product>) {
  const sm = await mlGet<RecList>(`/recommendations/semantic/${data.product_id}?limit=5`)
  if (sm) semantic.value = enrich(sm.recommendations, cat)
}
async function loadPlatform() {
  platform.value = await mlGet<ProductPlatform>(`/platform/product/${data.product_id}`)
}

useSeoMeta({
  title: data.seo?.title,
  ogTitle: data.seo?.title,
  description: data.seo?.description,
  ogDescription: data.seo?.description,
  ogImage: data.img_url,
  ogUrl: 'http://localhost:3000/product/' + slug,
  twitterCard: 'summary_large_image',
})
useHead({ htmlAttrs: { lang: 'en' }, meta: [{ name: 'keywords', content: (data.seo?.key_words || []).join(", ") }] })

async function addToCart() {
  if (await addToShoppingCartEvent(P())) {
    inCart.value = true
    toast.add({ title: 'Added to shopping cart', description: data.name, icon: 'i-lucide-shopping-cart' })
  }
}
async function removeFromCart() {
  if (await removeFromCartEvent(P())) { inCart.value = false; toast.add({ title: 'Removed from cart', description: data.name }) }
}
async function buy() {
  if (await buyProductEvent(P())) {
    inCart.value = false
    toast.add({ title: 'Purchase recorded', description: data.name, icon: 'i-lucide-check' })
  }
}
</script>
