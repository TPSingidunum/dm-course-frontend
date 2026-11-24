<!-- SEO content generation (POST /ml/ai/seo) with validation and a template fallback. -->
<template>
  <AdminPage title="AI content (SEO)">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <USelect v-model="productId" :items="options" class="w-full sm:max-w-md" />
      <UButton :loading="busy" data-testid="generate-seo" @click="generate">Generate SEO</UButton>
    </div>
    <UAlert v-if="error" color="error" variant="subtle" :title="error" />
    <UCard v-if="result" data-testid="seo-result">
      <div class="space-y-2 text-sm">
        <p><b>Title:</b> {{ result.seo_title }} <span class="text-xs text-muted">({{ result.seo_title?.length }}/60)</span></p>
        <p><b>Description:</b> {{ result.seo_description }} <span class="text-xs text-muted">({{ result.seo_description?.length }}/155)</span></p>
        <p><b>Keywords:</b> {{ (result.keywords || []).join(', ') }}</p>
        <p class="text-xs text-muted">source: {{ result.source }} <span v-if="result.fallback">· fallback: {{ result.fallback_reason }}</span></p>
      </div>
    </UCard>
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
