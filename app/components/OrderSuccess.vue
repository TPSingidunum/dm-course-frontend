<!-- Confirmation shown after a purchase (checkout and buy-now pages). -->
<template>
  <div class="mx-auto max-w-xl space-y-6 text-center" data-testid="order-success">
    <UIcon name="i-lucide-circle-check" class="mx-auto size-14 text-success" />
    <div class="space-y-1">
      <h2 class="text-2xl font-bold">Thank you for your order!</h2>
      <p class="text-muted">Your purchase was recorded.</p>
    </div>
    <ul class="divide-y divide-default rounded-lg border border-default text-left">
      <li v-for="i in items" :key="i.product_id" class="flex items-center justify-between gap-3 p-3 text-sm">
        <span class="min-w-0 truncate">{{ i.quantity }} × {{ i.name }}</span>
        <span class="font-medium">{{ formatPrice(lineTotal(i)) }}</span>
      </li>
      <li class="flex items-center justify-between p-3 font-bold">
        <span>Total</span><span>{{ formatPrice(orderTotal(items)) }}</span>
      </li>
    </ul>
    <div class="flex flex-wrap justify-center gap-3">
      <UButton to="/shop">Continue shopping</UButton>
      <UButton to="/" color="neutral" variant="outline">Home</UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CartItem } from '~/composables/useCart'

defineProps<{ items: CartItem[] }>()
</script>
