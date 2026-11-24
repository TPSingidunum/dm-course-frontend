<template>
  <AdminPage title="Update Product" back narrow>
    <DbAlert v-if="error" what="Product" />
    <ProductForm v-else :title="`Updating product ${id}`" submit-label="Update" :url="`/api/product/update/${id}`" :initial="data" />
  </AdminPage>
</template>

<script lang="ts" setup>
import type { Product } from '~/types/Product'

definePageMeta({ layout: 'admin' })

const id = useRoute().params.id
const { data, error } = await useFetch<Product>(`/api/product/id/${id}`)
</script>
