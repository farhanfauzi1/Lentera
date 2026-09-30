import { formatCurrency, formatNumber } from '../utils/currency.js'
import { formatDate, formatDateTime } from '../utils/date.js'

export function useFormat() {
  return { formatCurrency, formatNumber, formatDate, formatDateTime }
}
