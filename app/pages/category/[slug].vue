<template>
  <StorePage :title="data.category.name" back>
    <EmptyState v-if="!data.products.length" icon="i-lucide-package-open" title="No products in this category" description="Check back later or browse the whole shop.">
      <UButton to="/shop" variant="outline">Browse the shop</UButton>
    </EmptyState>
    <ProductGrid v-else>
      <ProductCard
        v-for="product in data.products" :key="product.product_id" :product="product" cart
        @add="cart.add(product, 'category_page')" />
    </ProductGrid>
  </StorePage>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'
import type { Product } from '~/types/Product'

const cart = useCart()
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
</script>
