<template>
  <UAlert
    color="error" variant="subtle" :title="`${what} are unavailable`"
    description="The database is not reachable. Start the local database and refresh this page." />
</template>

<script lang="ts" setup>
defineProps<{ what: string }>()
</script>
