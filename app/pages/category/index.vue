<template>
  <StorePage title="Categories">
    <DbAlert v-if="error" what="Categories" />
    <div class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
      <UBlogPost
        v-for="category in categories" :key="category.category_id" :title="category.name"
        :image="category.img_url" :to="`/category/${category.slug}`" class="w-full" />
    </div>
  </StorePage>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'

const { data: categories, error } = await useFetch<Category[]>('/api/category', { default: () => [] })
</script>
