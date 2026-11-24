<template>
  <UAlert
    color="error" variant="subtle" icon="i-lucide-database-zap" :title="`${what} are unavailable`"
    description="The database is not reachable. Start the local database and refresh this page."
    :actions="[{ label: 'Reload', icon: 'i-lucide-refresh-cw', color: 'error', variant: 'outline', onClick: () => reloadNuxtApp() }]" />
</template>

<script lang="ts" setup>
defineProps<{ what: string }>()
</script>
