<!-- Cart review + order placement. Placing the order records one `purchase` event per line item. -->
<template>
  <StorePage title="Checkout" :back="!order">
    <OrderSuccess v-if="order" :items="order" />

    <div v-else-if="!cart.ready.value" class="h-40 animate-pulse rounded-lg bg-elevated" />

    <EmptyState
      v-else-if="!cart.items.value.length" icon="i-lucide-shopping-cart" title="Your cart is empty"
      description="Add some products and they will show up here.">
      <UButton to="/shop">Browse the shop</UButton>
    </EmptyState>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <ul class="divide-y divide-default rounded-lg border border-default lg:col-span-2" data-testid="cart-items">
        <li v-for="item in cart.items.value" :key="item.product_id" class="flex flex-wrap items-center gap-4 p-4">
          <NuxtLink :to="`/product/${item.slug}`" class="size-20 shrink-0 overflow-hidden rounded-md bg-elevated">
            <NuxtImg :src="item.img_url" :alt="item.name" class="size-full object-contain" />
          </NuxtLink>
          <div class="min-w-0 flex-1 basis-40">
            <NuxtLink :to="`/product/${item.slug}`" class="font-semibold hover:underline">{{ item.name }}</NuxtLink>
            <p class="text-sm text-muted">{{ formatPrice(item.price) }} each</p>
          </div>
          <UInputNumber
            :model-value="item.quantity" :min="1" :max="99" class="w-32" :aria-label="`Quantity of ${item.name}`"
            @update:model-value="cart.setQuantity(item.product_id, $event)" />
          <p class="w-24 text-right font-bold">{{ formatPrice(lineTotal(item)) }}</p>
          <UButton
            icon="i-lucide-trash-2" color="neutral" variant="ghost" :aria-label="`Remove ${item.name}`"
            @click="cart.remove(item.product_id)" />
        </li>
      </ul>

      <aside class="h-fit space-y-4 rounded-lg border border-default p-5 lg:sticky lg:top-20">
        <h2 class="text-lg font-semibold">Order summary</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-muted">Items</dt><dd>{{ cart.count.value }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Shipping</dt><dd>Free</dd></div>
          <div class="flex justify-between border-t border-default pt-3 text-lg font-bold">
            <dt>Total</dt><dd data-testid="cart-total">{{ formatPrice(cart.total.value) }}</dd>
          </div>
        </dl>
        <UButton block size="lg" :loading="busy" data-testid="place-order" @click="placeOrder">Place order</UButton>
        <p class="text-xs text-muted">Demo store — no payment is taken.</p>
      </aside>
    </div>
  </StorePage>
</template>

<script lang="ts" setup>
import type { CartItem } from '~/composables/useCart'

useHead({ title: 'Checkout' })

const cart = useCart()
const busy = ref(false)
const order = ref<CartItem[] | null>(null)

async function placeOrder() {
  busy.value = true
  order.value = await cart.checkout()
  busy.value = false
}
</script>
