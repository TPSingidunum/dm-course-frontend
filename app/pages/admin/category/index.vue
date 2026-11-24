<template>
  <AdminPage title="Categories">
    <template #actions>
      <UButton icon="i-lucide-plus" to="/admin/category/create">Create Category</UButton>
    </template>

    <DbAlert v-if="error" what="Categories" />
    <AdminTable :data="categories" :columns="columns" searchable paginated :page-size="10">
      <template #actions-cell="{ row }">
        <RowActions :items="rowItems(row.original)" />
      </template>
    </AdminTable>

    <ConfirmDelete
      v-model:open="deleteOpen" title="Delete category" :description="`Delete category #${selectedId}? This cannot be undone.`"
      :url="`/api/category/id/${selectedId}`" @deleted="refresh" />
  </AdminPage>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'
import { useClipboard } from '@vueuse/core'

definePageMeta({ layout: 'admin' })

const toast = useToast()
const { copy } = useClipboard()
const { data: categories, error, refresh } = await useFetch<Category[]>('/api/category', { default: () => [] })

const deleteOpen = ref(false)
const selectedId = ref(0)

const columns = [
  { accessorKey: 'category_id', header: '#', cell: ({ row }: { row: { original: Category } }) => `#${row.original.category_id}` },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'created_at', header: 'Created at', cell: ({ row }: { row: { original: Category } }) => formatDate(row.original.created_at) },
  { id: 'actions' },
]

const rowItems = (c: Category) => [
  { label: 'Copy category ID', onSelect: () => { copy(String(c.category_id)); toast.add({ title: 'Category ID copied', color: 'success', icon: 'i-lucide-circle-check' }) } },
  { type: 'separator' as const },
  { label: 'Edit', onSelect: () => { navigateTo(`/admin/category/update/${c.category_id}`) } },
  { label: 'Delete', color: 'error' as const, onSelect: () => { selectedId.value = c.category_id; deleteOpen.value = true } },
]
</script>
