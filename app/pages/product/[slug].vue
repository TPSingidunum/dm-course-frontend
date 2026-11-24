<template>
  <StorePage back>
    <div class="grid gap-x-8 gap-y-6 lg:grid-cols-3">
      <div class="aspect-[4/3] w-full overflow-hidden rounded-lg bg-elevated lg:col-span-2">
        <NuxtImg :src="data.img_url" :alt="data.name" class="size-full object-contain" />
      </div>

      <!-- Buy box sits right under the image on mobile and in the right column on desktop. -->
      <aside class="min-w-0 lg:col-start-3 lg:row-span-2 lg:row-start-1">
        <div class="space-y-4 rounded-lg border border-default p-5 lg:sticky lg:top-20">
          <UBadge color="error">Sale</UBadge>
          <h1 class="text-2xl font-bold" data-testid="product-name">{{ data.name }}</h1>
          <p class="text-2xl font-bold" data-testid="product-price">{{ formatPrice(data.price) }}</p>
          <div class="flex flex-col gap-2">
            <UButton block @click="cart.add(data)">Add to cart</UButton>
            <UButton :to="`/buy/${data.slug}`" block variant="outline">Buy now</UButton>
            <template v-if="inCart">
              <UButton to="/checkout" block color="neutral" variant="soft">Go to checkout ({{ inCart.quantity }} in cart)</UButton>
              <UButton block color="neutral" variant="ghost" @click="cart.remove(data.product_id)">Remove from cart</UButton>
            </template>
          </div>
        </div>
      </aside>

      <div class="min-w-0 space-y-6 lg:col-span-2">
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
const slug = route.params.slug

const { data: fetched, error } = await useFetch<Product>(`/api/product/${slug}`)
if (!fetched.value) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: error.value?.statusMessage || 'Product not found'
  })
}
const data: Product = fetched.value

const cart = useCart()
const inCart = computed(() => cart.items.value.find(i => i.product_id === data.product_id))
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
  await trackProductView(eventProduct(toCartItem(data)), viewSource())
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
</script>
