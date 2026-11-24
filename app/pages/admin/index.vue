<template>
  <AdminPage title="Dashboard">
    <div class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
      <UPageCard
        v-for="s in sections" :key="s.to" :to="s.to" :icon="s.icon" :title="s.title" :description="s.description" />
    </div>
  </AdminPage>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'admin' })

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
