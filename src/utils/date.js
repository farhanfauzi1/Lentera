/**
 * Format tanggal ke format dd MMM yyyy
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/**
 * Format tanggal dan waktu
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format tanggal ke string YYYY-MM-DD untuk input
 * @param {string|Date} date
 * @returns {string}
 */
export function toInputDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Cek apakah tanggal dalam rentang
 * @param {string} date
 * @param {string} start
 * @param {string} end
 * @returns {boolean}
 */
export function isInDateRange(date, start, end) {
  const d = new Date(date)
  if (start && new Date(start) > d) return false
  if (end && new Date(end) < d) return false
  return true
}

/**
 * Mendapatkan tanggal hari ini sebagai string YYYY-MM-DD
 * @returns {string}
 */
export function today() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Mendapatkan tanggal N hari lalu
 * @param {number} days
 * @returns {string}
 */
export function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}
