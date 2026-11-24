<template>
  <div class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-default px-4 py-12 text-center">
    <UIcon :name="icon" class="size-10 text-dimmed" />
    <h2 class="text-lg font-semibold">{{ title }}</h2>
    <p v-if="description" class="max-w-md text-sm text-muted">{{ description }}</p>
    <slot />
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ title: string, description?: string, icon?: string }>(), {
  description: undefined,
  icon: 'i-lucide-inbox',
})
</script>
