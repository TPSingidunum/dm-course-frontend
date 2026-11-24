<!-- Campaigns — recommended audience (rule vs ML) with reasons + targeting comparison. -->
<template>
  <AdminPage title="Campaigns">
    <MlUnavailable v-if="down" :retry="loadCampaigns" />
    <AdminSection v-else title="All campaigns" description="Targeting rules per campaign.">
      <AdminTable :data="campaigns" :columns="campaignCols" data-testid="campaigns-table" />
    </AdminSection>

    <AdminSection title="Recommended audience" description="Who should receive the selected campaign.">
      <UCard>
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <USelect v-model="campaignId" :items="options" class="w-full sm:max-w-xs" aria-label="Campaign" />
          <div class="flex items-center gap-2">
            <UButton :variant="mode === 'ml' ? 'solid' : 'outline'" @click="setMode('ml')">ML</UButton>
            <UButton :variant="mode === 'rule' ? 'solid' : 'outline'" @click="setMode('rule')">Rule</UButton>
          </div>
          <UButton icon="i-lucide-users" data-testid="load-audience" @click="loadAudience">Show audience</UButton>
        </div>
      </UCard>
    </AdminSection>

    <UAlert
      v-if="audience?.fallback" color="warning" variant="subtle" icon="i-lucide-triangle-alert"
      :title="`Audience is rule-based (fallback: ${audience.fallback_reason})`"
      description="Train the models on the Segments and Conversion pages." />

    <template v-if="audience">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="audience-summary">
        <StatTile label="Campaign" icon="i-lucide-megaphone" :value="audience.campaign_name" :hint="`mode: ${audience.mode}`" />
        <StatTile label="Candidates" icon="i-lucide-users" :value="formatCell('count', audience.total_candidates)" />
        <StatTile label="Selected" icon="i-lucide-user-check" :value="formatCell('count', audience.selected)" />
        <StatTile label="Shown" icon="i-lucide-eye" :value="formatCell('count', audience.returned)" />
      </div>
      <AdminTable :data="audienceRows" :columns="audienceCols">
        <template #probability-cell="{ row }">
          <MeterBar v-if="row.original.probability != null" :value="Number(row.original.probability)" />
          <span v-else>—</span>
        </template>
        <template #why-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="r in row.original.reasons" :key="r" variant="subtle" color="neutral">{{ r }}</UBadge>
          </div>
        </template>
      </AdminTable>
    </template>

    <AdminSection
      v-if="comparison?.metrics" title="Rule vs ML" description="Expected outcome of both targeting modes.">
      <div class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3">
        <StatTile
          label="Expected conversions lift" icon="i-lucide-trending-up"
          :value="comparison.metrics.lift_expected_conversions != null ? `${comparison.metrics.lift_expected_conversions}×` : '—'" hint="ML vs rule" />
        <StatTile label="Overlap" icon="i-lucide-venn" :value="formatCell('count', comparison.metrics.overlap)" hint="customers in both" />
        <StatTile label="Jaccard" icon="i-lucide-percent" :value="formatCell('jaccard', comparison.metrics.jaccard)" />
      </div>
      <AdminTable :data="comparisonRows" :columns="comparisonCols" data-testid="comparison-table" />
    </AdminSection>
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
  return metrics ? (['rule', 'ml'] as const).map(m => ({ mode: m.toUpperCase(), ...metrics[m] })) : []
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
