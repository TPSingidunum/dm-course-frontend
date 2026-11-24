<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable :ui="{ footer: 'border-t border-default' }">
      <template #header="{ collapsed }">
        <NuxtLink to="/admin" class="w-full">
          <p v-if="!collapsed" class="text-2xl font-bold">DM</p>
          <UIcon v-else name="i-lucide-layout-dashboard" class="mx-auto block size-5 text-primary" />
        </NuxtLink>
      </template>
      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
      </template>
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const nav = (label: string, to: string, icon: string): NavigationMenuItem =>
  ({ label, icon, to, active: to === '/admin' ? route.path === to : route.path.startsWith(to) })

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Storefront', icon: 'i-lucide-house', to: '/' },
  nav('Dashboard', '/admin', 'i-lucide-layout-dashboard'),
  nav('Categories', '/admin/category', 'i-lucide-tags'),
  nav('Products', '/admin/product', 'i-lucide-package'),
  nav('Events', '/admin/event', 'i-lucide-activity'),
  nav('Segments', '/admin/segments', 'i-lucide-users'),
  nav('Conversion', '/admin/conversion', 'i-lucide-target'),
  nav('Campaigns', '/admin/campaigns', 'i-lucide-megaphone'),
  nav('Recommendations', '/admin/recommendations', 'i-lucide-chart-bar'),
  nav('AI content', '/admin/ai', 'i-lucide-sparkles'),
  nav('Marketing', '/admin/marketing', 'i-lucide-chart-pie'),
])
</script>
