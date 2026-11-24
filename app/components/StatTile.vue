<template>
  <div class="rounded-lg border border-default p-4">
    <div class="flex items-center gap-2 text-sm text-muted">
      <UIcon v-if="icon" :name="icon" class="size-4" />{{ label }}
    </div>
    <p class="mt-2 break-words font-bold" :class="String(value).length > 14 ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted">{{ hint }}</p>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ label: string, value: string | number, icon?: string, hint?: string }>()
</script>
