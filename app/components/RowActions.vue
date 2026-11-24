<!-- "…" menu for a table row. -->
<template>
  <div class="text-right">
    <UDropdownMenu :items="items" :content="{ align: 'end' }">
      <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Row actions" />
    </UDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{ items: DropdownMenuItem[] }>()
</script>
