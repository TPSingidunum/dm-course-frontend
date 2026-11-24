<template>
  <UAlert
    color="warning" variant="subtle" icon="i-lucide-plug-zap" :title="title || 'ML API is unavailable'"
    :description="description || 'The ML API is not reachable. Set NUXT_ML_API_URL to a running ML API; the store keeps working with default content.'"
    :actions="retry ? [{ label: 'Retry', icon: 'i-lucide-refresh-cw', color: 'warning', variant: 'outline', onClick: () => retry?.() }] : []" />
</template>

<script lang="ts" setup>
defineProps<{ title?: string, description?: string, retry?: () => void }>()
</script>
