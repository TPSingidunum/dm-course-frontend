<!-- Tracking check — latest events from the local database + counts per type. -->
<template>
  <AdminPage title="Events">
    <DbAlert v-if="error" what="Events" />
    <div class="flex flex-wrap gap-2" data-testid="event-counts">
      <UBadge v-for="c in data?.counts" :key="c.event_type" variant="subtle">{{ c.event_type }}: {{ c.n }}</UBadge>
    </div>
    <AdminTable :data="data?.events || []" :columns="cols" />
  </AdminPage>
</template>

<script lang="ts" setup>
import type { EventList } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const cols = columnsFor(['event_id', 'event_type', 'user_id', 'user_session', 'product_id', 'category_id', 'price', 'quantity',
  'source', 'timestamp', 'recommendation_source', 'recommendation_position'])
const { data, error } = await useFetch<EventList>('/api/event?limit=50')
</script>
