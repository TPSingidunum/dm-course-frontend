<!-- Table with optional search + pagination and the shared admin styling. -->
<template>
  <div class="space-y-3">
    <UInput v-if="searchable" v-model="filter" icon="i-lucide-search" placeholder="Filter..." class="w-full sm:max-w-xs" />
    <UTable
      v-model:global-filter="filter" v-model:pagination="pagination" :data="data" :columns="columns"
      :pagination-options="paginated ? { getPaginationRowModel: getPaginationRowModel() } : undefined"
      class="rounded-lg border border-default"
      :ui="{ th: 'whitespace-nowrap', td: 'whitespace-nowrap' }">
      <template v-for="(_, name) in $slots" #[name]="scope" :key="name">
        <slot :name="name" v-bind="scope" />
      </template>
    </UTable>
    <div v-if="paginated && total > pageSize" class="flex justify-center">
      <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any
const props = withDefaults(defineProps<{
  data: Row[]
  columns: TableColumn<Row>[]
  searchable?: boolean
  paginated?: boolean
  pageSize?: number
}>(), { pageSize: 10 })

const filter = ref('')
const pagination = ref({ pageIndex: 0, pageSize: props.pageSize })
const page = computed({
  get: () => pagination.value.pageIndex + 1,
  set: (p: number) => { pagination.value.pageIndex = p - 1 }
})
const total = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return props.data.length
  const keys = props.columns.map(c => (c as { accessorKey?: string }).accessorKey).filter(Boolean) as string[]
  return props.data.filter(r => keys.some(k => String(r[k] ?? '').toLowerCase().includes(q))).length
})
watch(filter, () => { pagination.value.pageIndex = 0 })
</script>
