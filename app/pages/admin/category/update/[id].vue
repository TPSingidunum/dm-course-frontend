<template>
  <div class="w-full">
    <UDashboardNavbar title="Update Category">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>
    <div class="flex w-full flex-1 flex-col gap-4 p-4 sm:p-6">
      <UAlert v-if="error" color="error" variant="subtle"
        title="Category is unavailable" description="The database is not reachable. Start the local database and refresh this page." />
      <div>
        <UButton icon="i-lucide-arrow-left-to-line" class="cursor-pointer" @click="router.back" />
      </div>
      <UCard class="w-full max-w-2xl self-center">
        <template #header>
          <h1> Updating category {{ data?.category_id }}</h1>
        </template>
        <UForm ref="form" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
          <UFormField label="Name" name="name">
            <UInput v-model="state.name" class="w-full" />
          </UFormField>

          <UFormField label="Slug" name="slug">
            <UInput v-model="state.slug" class="w-full" />
          </UFormField>
          
          <UFormField label="Image Url" name="img_url">
            <UInput v-model="state.img_url" class="w-full" />
          </UFormField>

          <div class="flex justify-end">
            <UButton type="submit" class="cursor-pointer">Update</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Category } from '~/types/Category'
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const route = useRoute();
const id = route.params.id;
const form = useTemplateRef('form')

const { data, error } = await useFetch<Category>('/api/category/id/' + id)

const schema = z.object({
  name: z.string('Name is required').min(3, 'Must be at least 3 characters').max(64, 'Must be at most 64 characters'),
  slug: z.string('Slug is required').regex(/^[a-z0-9-]{3,128}$/, "Your slug has to contain only lowercase letters, numbers and a - symbol"),
  img_url: z.httpUrl('Image Link is required'),
})
type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({
  name: data.value?.name,
  slug: data.value?.slug,
  img_url: data.value?.img_url
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch("/api/category/update/" + id, {
    method: "POST",
    body: event.data,
  }).then((res) => {
    if (res) {
      navigateTo('/admin/category')
    }
  }).catch((error) => {
    // Finish the create statement
    console.log(JSON.stringify(error.data, null, 2))
    form.value?.setErrors([
      {
        message: error.data.data.message,
        name: error.data.data.field
      }
    ])
  })
}
</script>
