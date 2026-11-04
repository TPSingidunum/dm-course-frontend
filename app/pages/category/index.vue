<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <h1 class="mb-5 text-2xl font-bold">Categories</h1>
    <UAlert v-if="categoryError" color="error" variant="subtle" class="mb-5"
      title="Categories are unavailable" description="The database is not reachable. Start the local database and refresh this page." />
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UBlogPost
        v-for="category in categories"
        :key="category.category_id"
        :image="category.img_url"
        class="w-full text-center"
        :title="category.name"
        :to="`/category/${category.slug}`"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'

const { data: categoryData, error: categoryError } = await useFetch<Category[]>('/api/category', {
  default: () => []
})
const categories = computed(() => categoryData.value ?? [])

</script>
