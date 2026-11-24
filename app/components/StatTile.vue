<template>
  <div class="rounded-lg border border-default p-4">
    <div class="flex items-center gap-2 text-sm text-muted">
      <UIcon :name="icon" class="size-4" />{{ label }}
    </div>
    <p class="mt-2 text-3xl font-bold">{{ value }}</p>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ label: string, value: string | number, icon: string }>()
</script>
