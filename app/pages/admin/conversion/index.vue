<!-- Day 3: conversion model — training, metrics + baseline, leakage before/after, per-user prediction. -->
<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-4">
      <h1 class="text-2xl font-bold">Conversion model</h1>
      <USelect v-model="modelType" :items="['logistic_regression', 'random_forest']" class="w-56" />
      <UButton :loading="busy" data-testid="train-conversion" @click="train">Train</UButton>
    </div>
    <MlUnavailable v-if="down" />
    <UAlert
v-else-if="!status" color="info" variant="subtle" title="Model not trained"
      description="Click “Train” (POST /ml/models/conversion/train)." class="mb-4" data-testid="untrained" />
    <p v-if="err" class="text-error mb-2">{{ err }}</p>
    <template v-if="status">
      <p class="text-sm mb-2">{{ status.model_type }} · window {{ status.window_days }} d · cutoff {{ status.cutoff }} ·
        train {{ status.n_train }} / test {{ status.n_test }} · base rate {{ status.base_rate }}</p>
      <UTable :data="metricRows" :columns="mCols" class="mb-4" data-testid="metrics-table" />
      <p class="text-sm mb-4">Confusion matrix (model): {{ status.metrics.confusion_matrix }} · baseline: {{ status.baseline.confusion_matrix }}</p>
      <template v-if="leak">
        <h2 class="text-xl font-bold mb-2">Leakage: clean vs leaky</h2>
        <UTable :data="leakRows" :columns="mCols" class="mb-6" />
      </template>
    </template>
    <h2 class="text-xl font-bold mb-2">Per-user prediction</h2>
    <div class="flex gap-2 items-center">
      <UInput v-model.number="uid" type="number" class="w-32" />
      <UButton data-testid="predict" @click="predict">GET probability</UButton>
      <span v-if="pred" data-testid="prediction">p = {{ pred.probability }}
        <UBadge v-if="pred.fallback" color="warning">fallback: {{ pred.reason }}</UBadge></span>
      <span v-if="predErr" class="text-error">{{ predErr }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { httpStatus } from '~/types/Ml'
import type { ConversionPrediction, ConversionStatus, ConversionTrainResult } from '~/types/Ml'

definePageMeta({ layout: 'admin' })
const modelType = ref('logistic_regression'); const status = ref<ConversionStatus | null>(null); const leak = ref<ConversionTrainResult['leakage'] | null>(null)
const busy = ref(false); const err = ref(""); const down = ref(false)
const uid = ref(DEMO_USER_ID); const pred = ref<ConversionPrediction | null>(null); const predErr = ref("")
const mCols = ['name', 'accuracy', 'precision', 'recall', 'f1'].map(x => ({ accessorKey: x, header: x }))
const metricRows = computed(() => status.value ? [{ name: 'model', ...status.value.metrics }, { name: 'majority baseline', ...status.value.baseline }] : [])
const leakRows = computed(() => leak.value ? [{ name: 'clean', ...leak.value.clean }, { name: 'leaky', ...leak.value.leaky }] : [])
async function load() {
  try { status.value = await $fetch<ConversionStatus>('/ml/models/conversion/status'); down.value = false }
  catch (e: unknown) { status.value = null; down.value = httpStatus(e) !== 503 }
}
async function train() {
  busy.value = true
  const r = await mlPost<ConversionTrainResult>('/models/conversion/train', { model_type: modelType.value })
  busy.value = false; err.value = r.error || ""
  if (r.data) { leak.value = r.data.leakage ?? null; await load() }
}
async function predict() {
  pred.value = null; predErr.value = ""
  try { pred.value = await $fetch<ConversionPrediction>(`/ml/customers/${uid.value}/conversion-probability`) }
  catch (e: unknown) { predErr.value = httpStatus(e) === 503 ? 'model not trained' : 'ML API unavailable' }
}
onMounted(load)
</script>
