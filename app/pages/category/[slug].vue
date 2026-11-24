<template>
  <StorePage :title="data.category.name" back>
    <ProductGrid>
      <ProductCard
        v-for="product in data.products" :key="product.product_id" :product="product" cart
        @add="addToCart(product)" />
    </ProductGrid>
  </StorePage>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'
import type { Product } from '~/types/Product'

const toast = useToast()
const slug = useRoute().params.slug

const { data: fetched, error } = await useFetch<{ category: Category, products: Product[] }>(`/api/category/${slug}`)
const data = fetched.value
if (!data) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: error.value?.statusMessage || 'Category not found'
  })
}

onMounted(() => trackCategoryView(data.category.category_id))

async function addToCart(p: Product) {
  // the user "saw" the product on the category page -> product_view + add_to_cart
  const ev = { product_id: p.product_id, price: p.price, category_id: p.category_id }
  await trackProductView(ev, 'category_page')
  if (await addToShoppingCartEvent(ev, 1, 'category_page')) toast.add({ title: 'Added to shopping cart', description: p.name })
}
</script>
