<template>
  <AdminPage title="Create Category" back narrow :crumbs="[{ label: 'Dashboard', to: '/admin' }, { label: 'Categories', to: '/admin/category' }, { label: 'Create' }]">
    <CategoryForm title="New category" submit-label="Create" url="/api/category/create" />
  </AdminPage>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'admin' })
</script>
