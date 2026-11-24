<template>
  <AdminPage title="Create Product" back narrow :crumbs="[{ label: 'Dashboard', to: '/admin' }, { label: 'Products', to: '/admin/product' }, { label: 'Create' }]">
    <ProductForm title="New product" submit-label="Create" url="/api/product/create" />
  </AdminPage>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'admin' })
</script>
