<!-- Shared create/update form for categories. -->
<template>
  <UCard>
    <template #header>
      <h2 class="font-semibold">{{ title }}</h2>
    </template>
    <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Name" name="name">
        <UInput v-model="state.name" class="w-full" />
      </UFormField>
      <UFormField label="Slug" name="slug">
        <UInput v-model="state.slug" class="w-full" />
      </UFormField>
      <UFormField label="Image URL" name="img_url">
        <UInput v-model="state.img_url" class="w-full" />
      </UFormField>
      <div class="flex justify-end">
        <UButton type="submit" :loading="busy">{{ submitLabel }}</UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'
import type { Category } from '~/types/Category'

const props = defineProps<{ title: string, submitLabel: string, url: string, initial?: Category | null }>()

const schema = z.object({
  name: z.string('Name is required').min(3, 'Must be at least 3 characters').max(64, 'Must be at most 64 characters'),
  slug: z.string('Slug is required').regex(/^[a-z0-9-]{3,128}$/, 'Your slug has to contain only lowercase letters, numbers and a - symbol'),
  img_url: z.httpUrl('Image Link is required'),
})
type Schema = z.output<typeof schema>

const form = useTemplateRef('form')
const busy = ref(false)
const state = reactive<Partial<Schema>>({
  name: props.initial?.name,
  slug: props.initial?.slug,
  img_url: props.initial?.img_url,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  busy.value = true
  try {
    if (await $fetch(props.url, { method: 'POST', body: event.data })) await navigateTo('/admin/category')
  } catch (e) {
    showServerError(form.value, e)
  } finally {
    busy.value = false
  }
}
</script>
