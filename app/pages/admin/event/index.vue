<!-- Tracking check — latest events from the local database + counts per type. Click a row's arrow for the rest of its fields. -->
<template>
  <AdminPage title="Events">
    <DbAlert v-if="error" what="Events" />
    <div class="flex flex-wrap gap-2" data-testid="event-counts">
      <UBadge v-for="c in data?.counts" :key="c.event_type" :color="eventColor(c.event_type)" variant="subtle">
        {{ c.event_type }}: {{ c.n }}
      </UBadge>
    </div>

    <AdminTable :data="data?.events || []" :columns="columns" empty-text="No events recorded yet.">
      <template #expand-cell="{ row }">
        <UButton
          color="neutral" variant="ghost" size="xs" aria-label="Show details"
          :icon="row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
          @click="row.toggleExpanded()" />
      </template>
      <template #event_type-cell="{ row }">
        <UBadge :color="eventColor(row.original.event_type)" variant="subtle">{{ row.original.event_type }}</UBadge>
      </template>
      <template #expanded="{ row }">
        <dl class="grid grid-cols-2 gap-x-6 gap-y-2 p-2 text-sm sm:grid-cols-4">
          <div v-for="f in details" :key="f"><dt class="text-xs text-muted">{{ f }}</dt><dd>{{ row.original[f] ?? '—' }}</dd></div>
        </dl>
      </template>
    </AdminTable>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { EventList } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const details = ['user_session', 'category_id', 'recommendation_source', 'recommendation_position']
const columns = [{ id: 'expand' }, ...columnsFor(['event_id', 'event_type', 'user_id', 'product_id', 'price', 'quantity', 'source', 'timestamp'])]
const { data, error } = await useFetch<EventList>('/api/event?limit=50')

const COLORS: Record<string, 'success' | 'primary' | 'warning' | 'info' | 'neutral'> = {
  purchase: 'success', add_to_cart: 'primary', remove_from_cart: 'warning',
  recommendation_impression: 'info', recommendation_click: 'info',
}
const eventColor = (type: string) => COLORS[type] ?? 'neutral'
</script>
