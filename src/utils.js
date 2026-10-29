// 75 -> "1:15"
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// 1024 -> "1K", 2300000 -> "2.3M"
export function formatCount(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 ? 1 : 0) + 'K'
  return String(n)
}

// "2026-10-24T14:31:47Z" -> "2026"
export function formatYear(date) {
  if (!date) return ''
  const y = new Date(date).getFullYear()
  return isNaN(y) ? '' : String(y)
}
