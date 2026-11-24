<!-- Titled block used to group tables/forms on admin pages. -->
<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <p v-if="description" class="text-sm text-muted">{{ description }}</p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </section>
</template>

<script lang="ts" setup>
defineProps<{ title: string, description?: string }>()
</script>
