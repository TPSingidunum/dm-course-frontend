<!-- Shared admin page shell: navbar (title, sidebar toggle, actions) + one consistently padded body. -->
<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="title">
        <template #leading><UDashboardSidebarCollapse /></template>
        <template #right>
          <slot name="actions" />
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="mx-auto w-full min-w-0 space-y-4" :class="narrow ? 'max-w-3xl' : ''">
        <UBreadcrumb v-if="crumbs?.length" :items="crumbs" />
        <UButton
          v-if="back" icon="i-lucide-arrow-left" color="neutral" variant="outline" label="Back"
          @click="$router.back()" />
        <slot />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'

defineProps<{ title: string, back?: boolean, narrow?: boolean, crumbs?: BreadcrumbItem[] }>()
</script>
