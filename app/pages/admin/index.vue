<template>
  <AdminPage title="Dashboard">
    <DbAlert v-if="failed" what="Dashboard numbers" />

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile label="Products" icon="i-lucide-package" :value="products.length" />
      <StatTile label="Categories" icon="i-lucide-tags" :value="categories.length" />
      <StatTile label="Events" icon="i-lucide-activity" :value="totalEvents" />
      <StatTile label="Purchases" icon="i-lucide-badge-check" :value="purchases" />
    </div>

    <UCard v-if="counts.length">
      <template #header><h2 class="font-semibold">Events by type</h2></template>
      <ul class="space-y-3">
        <li v-for="c in counts" :key="c.event_type" class="grid grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-3 text-sm">
          <span class="truncate">{{ c.event_type }}</span>
          <div class="h-2 overflow-hidden rounded-full bg-elevated">
            <div class="h-full rounded-full bg-primary" :style="{ width: `${(Number(c.n) / maxCount) * 100}%` }" />
          </div>
          <span class="tabular-nums text-muted">{{ c.n }}</span>
        </li>
      </ul>
    </UCard>

    <h2 class="pt-2 text-lg font-semibold">Sections</h2>
    <div class="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
      <UPageCard
        v-for="s in sections" :key="s.to" :to="s.to" :icon="s.icon" :title="s.title" :description="s.description"
        variant="soft" />
    </div>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'
import type { Product } from '~/types/Product'
import type { EventList } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const [{ data: products, error: e1 }, { data: categories, error: e2 }, { data: events, error: e3 }] = await Promise.all([
  useFetch<Product[]>('/api/shop', { default: () => [] }),
  useFetch<Category[]>('/api/category', { default: () => [] }),
  useFetch<EventList>('/api/event?limit=1'),
])

const failed = computed(() => !!(e1.value || e2.value || e3.value))
const counts = computed(() => events.value?.counts ?? [])
const totalEvents = computed(() => counts.value.reduce((n, c) => n + Number(c.n), 0))
const purchases = computed(() => Number(counts.value.find(c => c.event_type === 'purchase')?.n ?? 0))
const maxCount = computed(() => Math.max(1, ...counts.value.map(c => Number(c.n))))

const sections = [
  { title: 'Categories', to: '/admin/category', icon: 'i-lucide-tags', description: 'Manage store categories.' },
  { title: 'Products', to: '/admin/product', icon: 'i-lucide-package', description: 'Manage products and their SEO.' },
  { title: 'Events', to: '/admin/event', icon: 'i-lucide-activity', description: 'Latest tracked events and counts.' },
  { title: 'Segments', to: '/admin/segments', icon: 'i-lucide-users', description: 'Customer segmentation.' },
  { title: 'Conversion', to: '/admin/conversion', icon: 'i-lucide-target', description: 'Conversion model and predictions.' },
  { title: 'Campaigns', to: '/admin/campaigns', icon: 'i-lucide-megaphone', description: 'Campaign audiences and targeting.' },
  { title: 'Recommendations', to: '/admin/recommendations', icon: 'i-lucide-chart-bar', description: 'Offline and CTR evaluation.' },
  { title: 'AI content', to: '/admin/ai', icon: 'i-lucide-sparkles', description: 'Generate SEO content.' },
  { title: 'Marketing', to: '/admin/marketing', icon: 'i-lucide-chart-pie', description: 'Platform modules and profiles.' },
]
</script>
