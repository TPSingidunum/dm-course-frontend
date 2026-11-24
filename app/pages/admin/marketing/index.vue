<!-- Marketing dashboard — platform modules (class, availability, fallback) + demo user profile. -->
<template>
  <AdminPage title="Marketing platform">
    <MlUnavailable v-if="!modules && loaded" />
    <template v-if="modules">
      <p class="text-sm" data-testid="module-summary">
        modules {{ modules.modules.length }} · available {{ modules.modules.filter(m => m.available).length }}
      </p>
      <AdminTable :data="modules.modules" :columns="cols" data-testid="modules-table" />
    </template>

    <h2 class="text-xl font-bold">User profile</h2>
    <div class="flex flex-wrap items-center gap-2">
      <UInput v-model.number="userId" type="number" class="w-32" aria-label="User id" />
      <UButton @click="loadProfile">Profile</UButton>
    </div>
    <pre v-if="profile" class="overflow-x-auto rounded-lg bg-elevated p-3 text-xs" data-testid="profile">{{ JSON.stringify(profile, null, 2) }}</pre>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { PlatformModules } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const modules = ref<PlatformModules | null>(null)
const loaded = ref(false)
const userId = ref(DEMO_USER_ID)
const profile = ref<unknown>(null)
const cols = columnsFor(['day', 'id', 'name', 'class', 'available', 'endpoint', 'fallback'])

async function loadProfile() {
  profile.value = await mlGet(`/platform/profile/${userId.value}`)
}

onMounted(async () => {
  modules.value = await mlGet<PlatformModules>('/platform/modules')
  loaded.value = true
  await loadProfile()
})
</script>
