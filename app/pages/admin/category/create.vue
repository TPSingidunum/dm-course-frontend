<template>
  <AdminPage title="Create Category" back narrow>
    <CategoryForm title="New category" submit-label="Create" url="/api/category/create" />
  </AdminPage>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'admin' })
</script>
