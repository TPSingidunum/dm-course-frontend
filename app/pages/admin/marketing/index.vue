<!-- Day 12: marketing dashboard — platform modules (class, availability, fallback) + demo user profile. -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Marketing platform</h1>
    <MlUnavailable v-if="!mods && loaded" />
    <template v-if="mods">
      <p class="text-sm mb-2" data-testid="module-summary">modules {{ mods.modules.length }} · available {{ mods.modules.filter(m => m.available).length }}</p>
      <UTable :data="mods.modules" :columns="cols" class="mb-6" data-testid="modules-table" />
    </template>
    <div class="flex gap-2 items-center mb-2">
      <UInput v-model.number="uid" type="number" class="w-32" /><UButton @click="loadProfile">Profil</UButton>
    </div>
    <pre v-if="profile" class="text-xs bg-elevated p-3 rounded" data-testid="profile">{{ JSON.stringify(profile, null, 2) }}</pre>
  </div>
</template>
<script lang="ts" setup>
import type { PlatformModules } from '~/types/Ml'

definePageMeta({ layout: 'admin' })
const mods = ref<PlatformModules | null>(null); const loaded = ref(false); const uid = ref(DEMO_USER_ID); const profile = ref<unknown>(null)
const cols = ['day', 'id', 'name', 'class', 'available', 'endpoint', 'fallback'].map(x => ({ accessorKey: x, header: x }))
async function loadProfile() { profile.value = await mlGet(`/platform/profile/${uid.value}`) }
onMounted(async () => { mods.value = await mlGet<PlatformModules>('/platform/modules'); loaded.value = true; await loadProfile() })
</script>
