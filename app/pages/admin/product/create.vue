<template>
  <AdminPage title="Create Product" back narrow>
    <ProductForm title="New product" submit-label="Create" url="/api/product/create" />
  </AdminPage>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'admin' })
</script>
