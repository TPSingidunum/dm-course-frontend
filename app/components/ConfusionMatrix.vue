<!-- 2x2 confusion matrix: [[TN, FP], [FN, TP]]. -->
<template>
  <div class="inline-grid grid-cols-[auto_repeat(2,6rem)] gap-1.5 text-center text-sm">
    <span /><span class="text-xs text-muted">Predicted no</span><span class="text-xs text-muted">Predicted yes</span>
    <template v-for="(row, r) in matrix" :key="r">
      <span class="flex items-center pr-2 text-xs text-muted">{{ r ? 'Actual yes' : 'Actual no' }}</span>
      <div
        v-for="(n, c) in row" :key="c" class="rounded-md px-3 py-4"
        :class="r === c ? 'bg-success/15 text-success' : 'bg-error/10 text-error'">
        <p class="text-xl font-bold tabular-nums">{{ n.toLocaleString('en-US') }}</p>
        <p class="text-xs">{{ labels[r]?.[c] }}</p>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ matrix: number[][] }>()
const labels = [['true neg.', 'false pos.'], ['false neg.', 'true pos.']]
</script>
