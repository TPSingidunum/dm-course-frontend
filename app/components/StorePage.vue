<!-- Shared storefront page shell: consistent container, spacing, title row and optional back button. -->
<template>
  <UContainer class="space-y-6 py-6 sm:py-8">
    <div v-if="title || back || $slots.actions" class="flex flex-wrap items-center gap-3">
      <UButton
        v-if="back" icon="i-lucide-arrow-left" color="neutral" variant="outline" aria-label="Go back"
        @click="$router.back()" />
      <h1 v-if="title" class="text-2xl font-bold sm:text-3xl">{{ title }}</h1>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2 sm:ml-auto">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </UContainer>
</template>

<script lang="ts" setup>
defineProps<{ title?: string, back?: boolean }>()
</script>
