<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3 pb-5">
      <UButton icon="i-lucide-arrow-left-to-line" @click="router.back" />
      <h1 class="text-2xl font-bold">{{ data.category.name }}</h1>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <UCard v-for="product in data.products" :key="product.product_id">
        <NuxtLink :to="`/product/${product.slug}`">
          <NuxtImg class="aspect-[4/3] w-full rounded-md object-cover" :src="product.img_url" />
          <p class="text-lg font-bold pt-4">{{ product.name }}</p>
          <p class="text-gray-600 text-sm">{{ product.description.substring(0, 60) }}</p>
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
import type { Category } from '~/types/Category';
import type { Product } from '~/types/Product';

const router = useRouter()
const route = useRoute()
const toast = useToast()
const slug = route.params.slug;

interface CategoryData { category: Category, products: Product[] }
const { data: categoryData, error: categoryError } = await useFetch<CategoryData>(`/api/category/${slug}`)
const data = categoryData.value

if (!data) {
  throw createError({
    statusCode: categoryError.value?.statusCode || 404,
    statusMessage: categoryError.value?.statusMessage || 'Category not found'
  })
}

onMounted(() => trackCategoryView(data.category.category_id))

async function addToShoppingCart(p: Product) {
  // the user "saw" the product on the category page -> product_view (source=category_page) + add_to_cart
  const ev = { product_id: p.product_id, price: p.price, category_id: p.category_id }
  await trackProductView(ev, "category_page")
  if (await addToShoppingCartEvent(ev, 1, "category_page")) toast.add({ title: 'Added to shopping cart', description: p.name })
}
</script>
