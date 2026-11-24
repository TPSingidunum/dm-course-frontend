<!-- Generic delete confirmation. Emits `deleted` after a successful DELETE request. -->
<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #footer>
      <div class="flex w-full items-center justify-end gap-3">
        <p v-if="error" class="mr-auto text-sm text-error">{{ error }}</p>
        <UButton color="neutral" variant="outline" @click="close">Cancel</UButton>
        <UButton color="error" :loading="busy" @click="confirm">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{ title: string, description: string, url: string }>()
const emit = defineEmits<{ deleted: [] }>()
const open = defineModel<boolean>('open', { default: false })

const busy = ref(false)
const error = ref('')

function close() { open.value = false }

watch(open, () => { error.value = '' })

async function confirm() {
  busy.value = true
  try {
    if (!await $fetch(props.url, { method: 'DELETE' })) throw new Error('not deleted')
    open.value = false
    emit('deleted')
  } catch {
    error.value = 'Something went wrong'
  } finally {
    busy.value = false
  }
}
</script>
