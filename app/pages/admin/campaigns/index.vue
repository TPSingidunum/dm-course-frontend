<!-- Campaigns — recommended audience (rule vs ML) with reasons + targeting comparison. -->
<template>
  <AdminPage title="Campaigns">
    <MlUnavailable v-if="down" :retry="loadCampaigns" />
    <AdminTable v-else :data="campaigns" :columns="campaignCols" data-testid="campaigns-table" />

    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <USelect v-model="campaignId" :items="options" class="w-full sm:max-w-xs" />
      <div class="flex items-center gap-2">
        <UButton :variant="mode === 'ml' ? 'solid' : 'outline'" @click="setMode('ml')">ML</UButton>
        <UButton :variant="mode === 'rule' ? 'solid' : 'outline'" @click="setMode('rule')">Rule</UButton>
      </div>
      <UButton data-testid="load-audience" @click="loadAudience">Show audience</UButton>
    </div>

    <UAlert
      v-if="audience?.fallback" color="warning" variant="subtle"
      :title="`Audience is rule-based (fallback: ${audience.fallback_reason})`"
      description="Train the models on the Segments and Conversion pages." />
    <template v-if="audience">
      <p class="text-sm" data-testid="audience-summary">
        {{ audience.campaign_name }} · mode {{ audience.mode }} · candidates {{ audience.total_candidates }} ·
        selected {{ audience.selected }} · shown {{ audience.returned }}
      </p>
      <AdminTable :data="audienceRows" :columns="audienceCols" />
    </template>

    <template v-if="comparison?.metrics">
      <h2 class="text-xl font-bold">Rule vs ML</h2>
      <AdminTable :data="comparisonRows" :columns="comparisonCols" data-testid="comparison-table" />
      <p class="text-sm">
        expected conversions lift: {{ comparison.metrics.lift_expected_conversions }} · overlap {{ comparison.metrics.overlap }} ·
        jaccard {{ comparison.metrics.jaccard }}
      </p>
    </template>
  </AdminPage>
</template>

<script lang="ts" setup>
import type { Audience, Campaign, CampaignRow, TargetingComparison } from '~/types/Ml'

definePageMeta({ layout: 'admin' })

const campaigns = ref<CampaignRow[]>([])
const down = ref(false)
const campaignId = ref(1)
const mode = ref<'ml' | 'rule'>('ml')
const audience = ref<Audience | null>(null)
const comparison = ref<TargetingComparison | null>(null)

const campaignCols = columnsFor(['campaign_id', 'name', 'target_segments', 'eligible_buckets', 'min_probability', 'cost_per_contact', 'max_contacts'])
const audienceCols = columnsFor(['rank', 'user_id', 'probability', 'segment', 'rfm_bucket', 'monetary', 'score', 'why'])
const comparisonCols = columnsFor(['mode', 'size', 'expected_conversions', 'expected_profit', 'avg_probability'])

const options = computed(() => campaigns.value.map(c => ({ label: c.name, value: c.campaign_id })))
const audienceRows = computed(() => (audience.value?.audience || []).map(a => ({ ...a, why: (a.reasons || []).join('; ') })))
const comparisonRows = computed(() => {
  const metrics = comparison.value?.metrics
  return metrics ? (['rule', 'ml'] as const).map(m => ({ mode: m, ...metrics[m] })) : []
})

function setMode(m: 'ml' | 'rule') { mode.value = m }

async function loadAudience() {
  [audience.value, comparison.value] = await Promise.all([
    mlGet<Audience>(`/campaigns/${campaignId.value}/recommended-audience?mode=${mode.value}&limit=10`),
    mlGet<TargetingComparison>(`/campaigns/${campaignId.value}/targeting-comparison`),
  ])
}

async function loadCampaigns() {
  const list = await mlGet<Campaign[]>('/campaigns')
  down.value = !list
  if (!list) return
  campaigns.value = list.map(c => ({ ...c, target_segments: (c.target_segments || []).join(', '), eligible_buckets: (c.eligible_buckets || []).join(', ') }))
}

onMounted(loadCampaigns)
</script>
