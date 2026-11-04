<!-- Day 1: tracking check — latest events from the local database + counts per type. -->
<template>
  <div class="min-w-0 p-4 sm:p-6">
    <h1 class="text-2xl font-bold mb-4">Events</h1>
    <UAlert v-if="error" color="error" variant="subtle" class="mb-4"
      title="Events are unavailable" description="The database is not reachable. Start the local database and refresh this page." />
    <div class="flex flex-wrap gap-2 mb-4" data-testid="event-counts">
      <UBadge v-for="c in data?.counts" :key="c.event_type" variant="subtle">{{ c.event_type }}: {{ c.n }}</UBadge>
    </div>
    <UTable :data="data?.events || []" :columns="cols" class="w-full" :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'whitespace-nowrap py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'whitespace-nowrap border-b border-default',
      separator: 'h-0'
    }" />
  </div>
</template>
<script lang="ts" setup>
import type { EventList } from '~/types/Ml'

definePageMeta({ layout: 'admin' })
const cols = ['event_id', 'event_type', 'user_id', 'user_session', 'product_id', 'category_id', 'price', 'quantity',
  'source', 'timestamp', 'recommendation_source', 'recommendation_position'].map(k => ({ accessorKey: k, header: k }))
const { data, error } = await useFetch<EventList>('/api/event?limit=50')
</script>
