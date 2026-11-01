<template>
  <UAlert
color="warning" variant="subtle" :title="title || 'ML API is unavailable'"
    :description="description || 'The ML API is not reachable. Set NUXT_ML_API_URL to a running ML API; the store keeps working with default content.'" class="mb-4" />
</template>
<script lang="ts" setup>
defineProps<{ title?: string, description?: string }>()
</script>
