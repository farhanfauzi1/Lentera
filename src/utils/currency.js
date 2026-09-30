/**
 * Format angka ke format Rupiah
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'Rp0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format angka dengan pemisah ribuan
 * @param {number} number
 * @returns {string}
 */
export function formatNumber(number) {
  if (number === null || number === undefined) return '0'
  return new Intl.NumberFormat('id-ID').format(number)
}

/**
 * Parse string Rupiah ke number
 * @param {string} str
 * @returns {number}
 */
export function parseCurrency(str) {
  if (!str) return 0
  return parseInt(str.replace(/[^\d]/g, ''), 10) || 0
}
