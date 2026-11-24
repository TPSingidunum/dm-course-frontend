export function formatDate(d: string | Date | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
  })
}
