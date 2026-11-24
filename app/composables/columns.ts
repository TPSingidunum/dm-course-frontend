// Table columns for the admin ML pages: readable headers + sensible formatting picked from the column key.
// Rules are by name only, so any API values render well; unknown keys fall back to plain text/numbers.
import { UBadge } from '#components'

const WORDS: Record<string, string> = { id: 'ID', aov: 'AOV', rfm: 'RFM', ctr: 'CTR', ndcg: 'NDCG', ari: 'ARI', f1: 'F1', at: '@', k: 'K' }
const PERCENT = new Set(['share', 'ctr', 'conversion', 'probability', 'min_probability', 'avg_probability', 'catalog_coverage',
  'hit_rate_at_k', 'recall_at_k', 'precision_at_k', 'accuracy', 'precision', 'recall', 'f1', 'base_rate', 'jaccard'])
const MONEY = new Set(['monetary', 'aov', 'expected_profit', 'cost_per_contact'])
const FIXED3 = new Set(['ndcg_at_k', 'score'])
const NUMERIC = new Set(['count', 'size', 'rank', 'recency_days', 'frequency', 'impressions', 'clicks', 'expected_conversions',
  'max_contacts', 'score', 'ndcg_at_k'])

export function humanize(key: string) {
  const text = key.split('_').map(w => WORDS[w] ?? w).join(' ').replace(' @ K', ' @K')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatCell(key: string, value: unknown): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (typeof value === 'boolean' || Number.isNaN(n)) return String(value)
  if (PERCENT.has(key)) return `${(n * 100).toFixed(1)}%`
  if (MONEY.has(key)) return `€${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (FIXED3.has(key)) return n.toFixed(3)
  return Number.isInteger(n) ? n.toLocaleString('en-US') : String(+n.toFixed(3))
}

export function columnsFor(keys: string[]) {
  return keys.map((key) => {
    const numeric = PERCENT.has(key) || MONEY.has(key) || NUMERIC.has(key)
    return {
      accessorKey: key,
      header: humanize(key),
      meta: numeric ? { class: { th: 'text-right', td: 'text-right tabular-nums' } } : undefined,
      cell: ({ row }: { row: { original: Record<string, unknown> } }) => {
        const v = row.original[key]
        if (typeof v === 'boolean') return h(UBadge, { color: v ? 'success' : 'neutral', variant: 'subtle' }, () => v ? 'Yes' : 'No')
        return formatCell(key, v)
      },
    }
  })
}
