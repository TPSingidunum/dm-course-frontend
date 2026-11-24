<template>
  <AdminPage title="Products">
    <template #actions>
      <UButton icon="i-lucide-plus" to="/admin/product/create">Create Product</UButton>
    </template>

    <DbAlert v-if="error" what="Products" />
    <AdminTable :data="products" :columns="columns" searchable paginated :page-size="10">
      <template #actions-cell="{ row }">
        <RowActions :items="rowItems(row.original)" />
      </template>
    </AdminTable>

    <ConfirmDelete
      v-model:open="deleteOpen" title="Delete product" :description="`Delete product #${selectedId}? This cannot be undone.`"
      :url="`/api/product/id/${selectedId}`" @deleted="refresh" />
  </AdminPage>
</template>

<script lang="ts" setup>
import type { Product } from '~/types/Product'
import { useClipboard } from '@vueuse/core'

definePageMeta({ layout: 'admin' })

const toast = useToast()
const { copy } = useClipboard()
const { data: products, error, refresh } = await useFetch<Product[]>('/api/shop', { default: () => [] })

const deleteOpen = ref(false)
const selectedId = ref(0)

type Cell = { row: { original: Product } }
const columns = [
  { accessorKey: 'product_id', header: '#', cell: ({ row }: Cell) => `#${row.original.product_id}` },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'description', header: 'Description', cell: ({ row }: Cell) => row.original.description.slice(0, 30) + (row.original.description.length > 30 ? '…' : '') },
  { accessorKey: 'price', header: 'Price', cell: ({ row }: Cell) => formatPrice(row.original.price) },
  { accessorKey: 'created_at', header: 'Created at', cell: ({ row }: Cell) => formatDate(row.original.created_at) },
  { id: 'actions' },
]

const rowItems = (p: Product) => [
  { label: 'Copy product ID', onSelect: () => { copy(String(p.product_id)); toast.add({ title: 'Product ID copied', color: 'success', icon: 'i-lucide-circle-check' }) } },
  { label: 'View in shop', onSelect: () => { navigateTo(`/product/${p.slug}`) } },
  { type: 'separator' as const },
  { label: 'Edit', onSelect: () => { navigateTo(`/admin/product/update/${p.product_id}`) } },
  { label: 'Delete', color: 'error' as const, onSelect: () => { selectedId.value = p.product_id; deleteOpen.value = true } },
]
</script>
