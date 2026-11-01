<!-- Day 11: SEO content generation (POST /ml/ai/seo) with validation and a template fallback. -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">AI content (SEO)</h1>
    <div class="flex gap-2 items-center mb-4">
      <USelect v-model="pid" :items="products.map(p => ({ label: p.name, value: p.product_id }))" class="w-80" />
      <UButton :loading="busy" data-testid="generate-seo" @click="generate">Generate SEO</UButton>
    </div>
    <p v-if="err" class="text-error">{{ err }}</p>
    <UCard v-if="out" data-testid="seo-result">
      <p><b>Title:</b> {{ out.seo_title }} <span class="text-xs text-muted">({{ out.seo_title?.length }}/60)</span></p>
      <p><b>Description:</b> {{ out.seo_description }} <span class="text-xs text-muted">({{ out.seo_description?.length }}/155)</span></p>
      <p><b>Keywords:</b> {{ (out.keywords || []).join(', ') }}</p>
      <p class="text-xs text-muted mt-2">source: {{ out.source }} <span v-if="out.fallback">· fallback: {{ out.fallback_reason }}</span></p>
    </UCard>
  </div>
</template>
<script lang="ts" setup>
import type { Product } from '~/types/Product'
import type { Category } from '~/types/Category'
import type { SeoResult } from '~/types/Ml'
definePageMeta({ layout: 'admin' })
const products = ref<Product[]>([]); const pid = ref(1); const out = ref<SeoResult | null>(null); const err = ref(""); const busy = ref(false)
const catNames = ref<Record<number, string>>({})
onMounted(async () => {
  products.value = Object.values((await useCatalog()).value)
  const cats = await $fetch<Category[]>('/api/category').catch((): Category[] => [])
  catNames.value = Object.fromEntries(cats.map(c => [c.category_id, c.name]))
})
async function generate() {
  const p = products.value.find(x => x.product_id === pid.value); if (!p) return
  busy.value = true
  const r = await mlPost<SeoResult>('/ai/seo', { product_name: p.name, description: p.description, category_name: catNames.value[p.category_id] || '' })
  busy.value = false; err.value = r.error ? `dm-ml: ${r.error}` : ''; out.value = r.data
}
</script>
