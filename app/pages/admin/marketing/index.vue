<!-- Marketing dashboard — platform modules (class, availability, fallback) + demo user profile. -->
<template>
  <AdminPage title="Marketing platform">
    <MlUnavailable v-if="!modules && loaded" :retry="init" />
    <template v-if="modules">
      <div class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3" data-testid="module-summary">
        <StatTile label="Modules" icon="i-lucide-blocks" :value="modules.modules.length" />
        <StatTile label="Available" icon="i-lucide-circle-check" :value="available" />
        <StatTile label="Using fallback" icon="i-lucide-triangle-alert" :value="modules.modules.length - available" />
      </div>
      <AdminSection title="Platform modules" description="Every module, its endpoint and what it falls back to.">
        <AdminTable :data="modules.modules" :columns="cols" data-testid="modules-table" />
      </AdminSection>
    </template>

    <AdminSection title="User profile" description="What the platform knows about one customer.">
      <UCard>
        <div class="flex flex-wrap items-center gap-3">
          <UInput v-model.number="userId" type="number" class="w-32" aria-label="User id" />
          <UButton icon="i-lucide-user-search" @click="loadProfile">Load profile</UButton>
        </div>
        <template v-if="profile">
          <div class="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-3">
            <StatTile label="Segment" icon="i-lucide-users" :value="profile.segment?.label ?? '—'" />
            <StatTile label="RFM bucket" icon="i-lucide-layers" :value="profile.rfm?.bucket ?? '—'" />
            <StatTile label="Purchase probability" icon="i-lucide-target" :value="formatCell('probability', profile.conversion?.probability)" />
          </div>
          <UCollapsible class="mt-4">
            <UButton color="neutral" variant="link" trailing-icon="i-lucide-chevron-down" class="px-0">Raw JSON</UButton>
            <template #content>
              <pre class="mt-2 overflow-x-auto rounded-lg bg-elevated p-3 text-xs" data-testid="profile">{{ JSON.stringify(profile, null, 2) }}</pre>
            </template>
          </UCollapsible>
        </template>
      </UCard>
    </AdminSection>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { PlatformModules } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

interface Profile {
  segment?: { label?: string }
  rfm?: { bucket?: string }
  conversion?: { probability?: number }
}

const modules = ref<PlatformModules | null>(null)
const loaded = ref(false)
const userId = ref(DEMO_USER_ID)
const profile = ref<Profile | null>(null)
const cols = columnsFor(['day', 'id', 'name', 'class', 'available', 'endpoint', 'fallback'])
const available = computed(() => modules.value?.modules.filter(m => m.available).length ?? 0)

async function loadProfile() {
  profile.value = await mlGet<Profile>(`/platform/profile/${userId.value}`)
}

async function init() {
  modules.value = await mlGet<PlatformModules>('/platform/modules')
  loaded.value = true
  await loadProfile()
}

onMounted(init)
</script>
