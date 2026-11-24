<!-- One product card for shop, category, search and recommendations. -->
<template>
  <article
    ref="root"
    class="group flex h-full flex-col overflow-hidden rounded-lg border border-default bg-default transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
    <NuxtLink :to="`/product/${product.slug}`" class="flex flex-1 flex-col" @click="emit('open')">
      <div class="relative aspect-[4/3] w-full bg-elevated" :class="{ 'animate-pulse': !loaded && product.img_url }">
        <NuxtImg
          v-if="product.img_url" :src="product.img_url" :alt="product.name" loading="lazy"
          class="size-full object-contain transition duration-300 group-hover:scale-105" :class="loaded ? 'opacity-100' : 'opacity-0'"
          @load="loaded = true" />
        <UBadge v-if="badge" :color="badgeColor" variant="solid" class="absolute left-2 top-2">{{ badge }}</UBadge>
      </div>
      <div class="flex-1 space-y-1 p-4">
        <h3 class="font-semibold leading-snug">{{ product.name }}</h3>
        <p v-if="product.description" class="line-clamp-2 text-sm text-muted">{{ product.description }}</p>
        <p v-if="meta" class="text-xs text-muted">{{ meta }}</p>
      </div>
    </NuxtLink>
    <div class="flex items-center justify-between gap-2 px-4 pb-4">
      <span class="text-lg font-bold">{{ formatPrice(product.price) }}</span>
      <UButton
        v-if="cart" icon="i-lucide-shopping-cart" size="sm" :aria-label="`Add ${product.name} to cart`"
        @click="emit('add')" />
    </div>
  </article>
</template>

<script lang="ts" setup>
import type { Rec } from '~/types/Product'

withDefaults(defineProps<{
  product: Rec
  badge?: string
  badgeColor?: 'primary' | 'error' | 'neutral' | 'warning'
  meta?: string
  cart?: boolean
}>(), { badge: undefined, badgeColor: 'primary', meta: undefined })

const emit = defineEmits<{ open: [], add: [] }>()

// Images served from cache can finish loading before hydration, so also check `complete` once mounted.
const root = useTemplateRef<HTMLElement>('root')
const loaded = ref(false)
onMounted(() => { if (root.value?.querySelector('img')?.complete) loaded.value = true })
</script>
