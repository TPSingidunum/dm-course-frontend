<!-- "Buy now" for a single product. Confirming records one `purchase` event (source: buy_now); the cart is untouched. -->
<template>
  <StorePage title="Buy now" back>
    <OrderSuccess v-if="order" :items="order" />

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <div class="flex flex-wrap items-center gap-4 rounded-lg bg-elevated/40 p-4 lg:col-span-2">
        <div class="size-28 shrink-0 overflow-hidden rounded-md bg-elevated">
          <NuxtImg :src="product.img_url" :alt="product.name" class="size-full object-contain" />
        </div>
        <div class="min-w-0 flex-1 basis-48 space-y-1">
          <h2 class="text-lg font-semibold">{{ product.name }}</h2>
          <p class="line-clamp-2 text-sm text-muted">{{ product.description }}</p>
          <p class="font-bold">{{ formatPrice(product.price) }}</p>
        </div>
        <UInputNumber v-model="quantity" :min="1" :max="99" class="w-32" aria-label="Quantity" />
      </div>

      <aside class="h-fit space-y-4 rounded-lg bg-elevated/40 p-5 lg:sticky lg:top-20">
        <h2 class="text-lg font-semibold">Order summary</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-muted">{{ quantity }} × {{ product.name }}</dt><dd>{{ formatPrice(total) }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Shipping</dt><dd>Free</dd></div>
          <div class="flex justify-between border-t border-default pt-3 text-lg font-bold">
            <dt>Total</dt><dd data-testid="buy-total">{{ formatPrice(total) }}</dd>
          </div>
        </dl>
        <UButton block size="lg" :loading="busy" data-testid="confirm-buy" @click="confirm">Confirm purchase</UButton>
        <p class="text-xs text-muted">Demo store — no payment is taken.</p>
      </aside>
    </div>
  </StorePage>
</template>

<script lang="ts" setup>
import type { CartItem } from '~/composables/useCart'
import type { Product } from '~/types/Product'

const slug = useRoute().params.slug
const { data, error } = await useFetch<Product>(`/api/product/${slug}`)
if (!data.value) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: error.value?.statusMessage || 'Product not found'
  })
}
const product: Product = data.value
useHead({ title: `Buy ${product.name}` })

const cart = useCart()
const quantity = ref(1)
const busy = ref(false)
const order = ref<CartItem[] | null>(null)
const total = computed(() => (product.price ?? 0) * quantity.value)

onMounted(() => trackProductView(eventProduct(toCartItem(product)), 'buy_now'))

async function confirm() {
  busy.value = true
  const line = toCartItem(product, quantity.value)
  if (await cart.purchase([line], 'buy_now')) order.value = [line]
  busy.value = false
}
</script>
