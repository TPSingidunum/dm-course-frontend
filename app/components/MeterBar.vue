<!-- Value (0..1) as a small bar plus percentage, for table cells. -->
<template>
  <div class="flex items-center justify-end gap-2">
    <div class="h-1.5 w-20 overflow-hidden rounded-full bg-elevated">
      <div class="h-full rounded-full bg-primary" :style="{ width: `${fill}%` }" />
    </div>
    <span class="w-12 text-right tabular-nums">{{ (value * 100).toFixed(1) }}%</span>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{ value: number, max?: number }>(), { max: 1 })
const fill = computed(() => Math.min(Math.max(props.value / props.max, 0), 1) * 100)
</script>
