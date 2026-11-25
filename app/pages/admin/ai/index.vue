<!-- SEO content generation (POST /ml/ai/seo) with validation and a template fallback. -->
<template>
  <AdminPage title="AI content (SEO)">
    <UCard>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <USelect v-model="productId" :items="options" placeholder="Select a product" class="w-full sm:max-w-md" aria-label="Product" />
        <UButton icon="i-lucide-sparkles" :loading="busy" data-testid="generate-seo" @click="generate">Generate SEO</UButton>
      </div>
    </UCard>

    <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />

    <template v-if="result">
      <div class="grid gap-4 lg:grid-cols-2" data-testid="seo-result">
        <AdminSection title="Search result preview">
          <div class="space-y-1 rounded-lg bg-elevated/50 p-4">
            <p class="truncate text-sm text-muted">yourstore.com › product</p>
            <p class="text-lg font-medium text-primary">{{ result.seo_title }}</p>
            <p class="text-sm">{{ result.seo_description }}</p>
          </div>
        </AdminSection>

        <AdminSection title="Quality checks">
          <div class="space-y-4 rounded-lg bg-elevated/50 p-4">
            <div v-for="m in meters" :key="m.label" class="space-y-1">
              <div class="flex justify-between text-sm"><span>{{ m.label }}</span><span class="tabular-nums text-muted">{{ m.length }}/{{ m.max }}</span></div>
              <UProgress :model-value="Math.min(m.length / m.max, 1) * 100" :color="m.length > m.max ? 'error' : 'success'" />
            </div>
          </div>
        </AdminSection>
      </div>

      <AdminSection title="Keywords">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge v-for="kw in result.keywords" :key="kw" variant="subtle">{{ kw }}</UBadge>
          <span v-if="!result.keywords?.length" class="text-sm text-muted">No keywords returned.</span>
        </div>
      </AdminSection>

      <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
        <UBadge variant="outline" color="neutral">source: {{ result.source }}</UBadge>
        <UBadge v-if="result.fallback" color="warning" variant="subtle">fallback: {{ result.fallback_reason }}</UBadge>
      </div>
    </template>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { Product } from '~/types/Product'
import type { Category } from '~/types/Category'
import type { SeoResult } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const products = ref<Product[]>([])
const categoryNames = ref<Record<number, string>>({})
const productId = ref<number>()
const result = ref<SeoResult | null>(null)
const error = ref('')
const busy = ref(false)

const options = computed(() => products.value.map(p => ({ label: p.name, value: p.product_id })))
const meters = computed(() => [
  { label: 'Title', length: result.value?.seo_title?.length ?? 0, max: 60 },
  { label: 'Description', length: result.value?.seo_description?.length ?? 0, max: 155 },
])

onMounted(async () => {
  products.value = Object.values((await useCatalog()).value)
  productId.value = products.value[0]?.product_id
  const categories = await $fetch<Category[]>('/api/category').catch((): Category[] => [])
  categoryNames.value = Object.fromEntries(categories.map(c => [c.category_id, c.name]))
})

async function generate() {
  const p = products.value.find(x => x.product_id === productId.value)
  if (!p) return
  busy.value = true
  const r = await mlPost<SeoResult>('/ai/seo', {
    product_name: p.name, description: p.description, category_name: categoryNames.value[p.category_id] || ''
  })
  busy.value = false
  error.value = r.error ? `ML API: ${r.error}` : ''
  result.value = r.data
}
</script>
