import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from '../utils/currency.js'
import { formatDate } from '../utils/date.js'

export function useExport() {
  function exportExcel(data, columns, filename = 'laporan') {
    const header = columns.map(c => c.label)
    const rows = data.map(row => columns.map(c => {
      const val = row[c.key]
      if (c.format === 'currency') return formatCurrency(val)
      if (c.format === 'date') return formatDate(val)
      return val ?? ''
    }))

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  function exportPDF(data, columns, title, filename = 'laporan') {
    const doc = new jsPDF({ orientation: 'landscape' })

    doc.setFontSize(14)
    doc.text('Bank Sampah Lentere', 14, 15)
    doc.setFontSize(11)
    doc.text(title, 14, 22)
    doc.setFontSize(9)
    doc.text(`Dicetak: ${formatDate(new Date())}`, 14, 28)

    autoTable(doc, {
      startY: 33,
      head: [columns.map(c => c.label)],
      body: data.map(row => columns.map(c => {
        const val = row[c.key]
        if (c.format === 'currency') return formatCurrency(val)
        if (c.format === 'date') return formatDate(val)
        return val ?? ''
      })),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 77, 46] },
    })

    doc.save(`${filename}.pdf`)
  }

  function printPage() {
    window.print()
  }

  return { exportExcel, exportPDF, printPage }
}
