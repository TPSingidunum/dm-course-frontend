<template>
  <UAlert color="warning" variant="subtle" :title="title || 'dm-ml is unavailable'"
    :description="description || 'Start the dm-ml API (dm-course-monorepo/apps/api): .venv/bin/uvicorn app.main:app --port 3001'" class="mb-4" />
</template>
<script lang="ts" setup>
defineProps<{ title?: string, description?: string }>()
</script>
