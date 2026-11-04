// Response shapes of the ML API endpoints used by the pages.
// Only the fields the UI reads are typed; table rows are generic records.
import type { Rec } from './Product'

export type Row = Record<string, unknown>

export interface FallbackInfo {
  fallback?: boolean
  fallback_reason?: string | null
}

export interface SeoResult extends FallbackInfo {
  seo_title?: string
  seo_description?: string
  keywords?: string[]
  source?: string
}

export interface Campaign extends Row {
  campaign_id: number
  name: string
  target_segments?: string[]
  eligible_buckets?: string[]
}

// Campaign as shown in the table (list fields joined into strings).
export interface CampaignRow extends Row {
  campaign_id: number
  name: string
  target_segments: string
  eligible_buckets: string
}

export interface AudienceMember extends Row {
  reasons?: string[]
}

export interface Audience extends FallbackInfo {
  campaign_name: string
  mode: string
  total_candidates: number
  selected: number
  returned: number
  audience?: AudienceMember[]
}

export interface TargetingComparison {
  metrics?: {
    rule: Row
    ml: Row
    lift_expected_conversions?: number
    overlap?: number
    jaccard?: number
  }
}

export interface ClassificationMetrics extends Row {
  confusion_matrix?: number[][]
}

export interface ConversionStatus {
  model_type: string
  window_days: number
  cutoff: string
  n_train: number
  n_test: number
  base_rate: number
  metrics: ClassificationMetrics
  baseline: ClassificationMetrics
}

export interface ConversionTrainResult {
  leakage?: { clean: ClassificationMetrics, leaky: ClassificationMetrics }
}

export interface ConversionPrediction {
  probability: number
  fallback?: boolean
  reason?: string
}

export interface EventCount {
  event_type: string
  n: number
}

export interface EventList {
  counts: EventCount[]
  events: Row[]
}

export interface PlatformModule extends Row {
  available: boolean
}

export interface PlatformModules {
  modules: PlatformModule[]
}

export interface EvalReport {
  split_time: string
  k?: number
  n_test_users?: number
  n_test_cases?: number
  n_test_sessions?: number
  n_train_events?: number
  n_test_events?: number
  comparison: Row[]
}

export interface CtrGroup extends Row {
  impressions: number
  clicks: number
  ctr: number
}

export interface CtrReport {
  overall: CtrGroup
  by_algorithm: { groups: CtrGroup[] }
  by_position: { groups: CtrGroup[] }
}

export interface SessionComparison {
  n_sessions: number
  comparison: Row[]
}

export interface SegmentsMeta {
  k: number
  silhouette: number
  n_customers: number
  reference: string
  segments: Row[]
  comparison?: {
    ari: number
    dominant_cluster?: Record<string, Row>
  }
}

// Status code of an error thrown by $fetch (FetchError), if any.
export function httpStatus(e: unknown): number | undefined {
  if (e && typeof e === 'object') {
    const err = e as { statusCode?: number, status?: number }
    return err.statusCode ?? err.status
  }
  return undefined
}

export interface RecList extends FallbackInfo {
  recommendations?: Rec[]
}

export interface GeneratedContent extends FallbackInfo {
  content?: string
  source?: string
  module_class?: string
}

export interface Homepage {
  user_id: number
  hero?: GeneratedContent
  profile?: {
    conversion?: { probability?: number }
    rfm?: { bucket?: string }
    segment?: { label?: string }
  }
  recommendations?: RecList
}

export interface ProductPlatform {
  ai_description?: GeneratedContent
}

export interface SemanticSearch extends FallbackInfo {
  method?: string
  embedder?: string
  results?: Rec[]
}

export interface SeoResponse {
  title: string
  description: string
  keywords: string[]
}
