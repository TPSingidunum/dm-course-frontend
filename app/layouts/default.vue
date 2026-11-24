<template>
  <div class="flex min-h-screen flex-col">
    <UHeader title="DM" to="/">
      <UNavigationMenu :items="items" />
      <template #body>
        <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>

    <main class="flex-1">
      <slot />
    </main>

    <UFooter>
      <p class="text-sm text-muted">Copyright © {{ new Date().getUTCFullYear() }}</p>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
getOrGenerateSessionId()

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Home', to: '/', active: route.path === '/' },
  { label: 'Shop', to: '/shop', active: route.path.startsWith('/shop') },
  { label: 'Category', to: '/category', active: route.path.startsWith('/category') },
  { label: 'Search', to: '/search', active: route.path.startsWith('/search') },
  { label: 'Admin', to: '/admin' },
])
</script>
