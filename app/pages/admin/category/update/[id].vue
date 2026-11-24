<template>
  <AdminPage title="Update Category" back narrow :crumbs="[{ label: 'Dashboard', to: '/admin' }, { label: 'Categories', to: '/admin/category' }, { label: 'Update' }]">
    <DbAlert v-if="error" what="Category" />
    <CategoryForm v-else :title="`Updating category ${id}`" submit-label="Update" :url="`/api/category/update/${id}`" :initial="data" />
  </AdminPage>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'

definePageMeta({ layout: 'admin' })

const id = useRoute().params.id
const { data, error } = await useFetch<Category>(`/api/category/id/${id}`)
</script>
