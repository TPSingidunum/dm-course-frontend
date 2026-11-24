<template>
  <div class="flex min-h-screen flex-col">
    <UHeader title="DM" to="/">
      <UNavigationMenu :items="items" />

      <template #right>
        <form class="hidden lg:block" @submit.prevent="search">
          <UInput v-model="query" icon="i-lucide-search" placeholder="Search products…" class="w-56" aria-label="Search products" />
        </form>
        <UColorModeButton />
        <UChip :text="cart.count.value" :show="cart.count.value > 0" size="3xl" color="primary">
          <UButton to="/checkout" icon="i-lucide-shopping-cart" color="neutral" variant="ghost" aria-label="Cart" />
        </UChip>
      </template>

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
const cart = useCart()
const query = ref('')
getOrGenerateSessionId()
onMounted(cart.load)

function search() {
  if (query.value.trim()) navigateTo({ path: '/search', query: { q: query.value.trim() } })
}

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Home', to: '/', active: route.path === '/' },
  { label: 'Shop', to: '/shop', active: route.path.startsWith('/shop') },
  { label: 'Category', to: '/category', active: route.path.startsWith('/category') },
  { label: 'Search', to: '/search', active: route.path.startsWith('/search') },
  { label: 'Admin', to: '/admin' },
])
</script>
