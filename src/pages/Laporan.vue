<template>
  <div>
    <PageHeader title="Laporan Operasional" subtitle="Rekapitulasi data transaksi, nasabah, dan timbulan sampah">
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="handlePrint">
          <Printer :size="16" /> Cetak
        </BaseButton>
        <BaseButton variant="outline" size="sm" @click="handleExportPDF">
          <FileText :size="16" /> Export PDF
        </BaseButton>
        <BaseButton size="sm" @click="handleExportExcel">
          <Download :size="16" /> Export Excel
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Report Type Tabs -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-2 pb-4 border-b border-border">
        <button
          v-for="t in availableTabs"
          :key="t.key"
          @click="activeTab = t.key"
          :class="[
            'px-4 py-2 rounded-pill text-sm font-semibold transition',
            activeTab === t.key ? 'bg-green-900 text-white' : 'bg-gray-100 text-muted hover:bg-green-50 hover:text-green-900',
          ]"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Filters -->
      <div class="pt-4 flex flex-wrap gap-3 items-center">
        <select v-model="periodPreset" class="input-field w-auto" @change="onPresetChange">
          <option value="all">Semua Waktu</option>
          <option value="today">Hari Ini</option>
          <option value="7days">7 Hari Terakhir</option>
          <option value="month">Bulan Ini</option>
          <option value="year">Tahun Ini</option>
          <option value="custom">Kustom Rentang</option>
        </select>

        <div v-if="periodPreset === 'custom'" class="flex items-center gap-2">
          <input v-model="startDate" type="date" class="input-field py-1.5 text-sm" />
          <span class="text-xs text-muted">s/d</span>
          <input v-model="endDate" type="date" class="input-field py-1.5 text-sm" />
        </div>
      </div>
    </div>

    <!-- Summary Total Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div v-for="(stat, idx) in summaryCards" :key="idx" class="card bg-green-50/50 border border-green-200/50">
        <p class="text-xs font-semibold text-muted uppercase tracking-wider">{{ stat.label }}</p>
        <p class="text-2xl font-bold text-green-900 mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Report Table Display -->
    <div class="card" id="report-table-area">
      <div class="print-only text-center mb-6">
        <h2 class="text-xl font-bold text-green-900">BANK SAMPAH LENTERE</h2>
        <h3 class="text-sm font-semibold text-text mt-1">{{ currentTabTitle }}</h3>
        <p class="text-xs text-muted">Periode: {{ periodLabel }}</p>
      </div>

      <BaseTable :columns="currentColumns" :data="reportData" :loading="loading">
        <template #default="{ row }">
          <!-- Setoran Rows -->
          <template v-if="activeTab === 'setoran'">
            <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
            <td class="px-4 py-3 text-xs text-muted">{{ formatDateTime(row.tanggal) }}</td>
            <td class="px-4 py-3 font-medium text-text">{{ row.nasabahNama }}</td>
            <td class="px-4 py-3 font-bold text-green-900">{{ formatCurrency(row.total) }}</td>
            <td class="px-4 py-3 text-xs text-muted">{{ row.petugasNama }}</td>
            <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
          </template>

          <!-- Penarikan Rows -->
          <template v-else-if="activeTab === 'penarikan'">
            <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
            <td class="px-4 py-3 text-xs text-muted">{{ formatDateTime(row.tanggal) }}</td>
            <td class="px-4 py-3 font-medium text-text">{{ row.nasabahNama }}</td>
            <td class="px-4 py-3 font-bold text-danger">{{ formatCurrency(row.total) }}</td>
            <td class="px-4 py-3 text-xs text-muted">{{ row.petugasNama }}</td>
            <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
          </template>

          <!-- Nasabah Rows -->
          <template v-else-if="activeTab === 'nasabah'">
            <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
            <td class="px-4 py-3 font-medium text-text">{{ row.nama }}</td>
            <td class="px-4 py-3 text-xs text-muted">{{ row.telepon || '-' }}</td>
            <td class="px-4 py-3 text-xs text-muted">{{ row.alamat || '-' }}</td>
            <td class="px-4 py-3 font-bold text-green-900">{{ formatCurrency(row.saldo) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
          </template>

          <!-- Sampah Rows -->
          <template v-else-if="activeTab === 'sampah'">
            <td class="px-4 py-3 font-medium text-text">{{ row.nama }}</td>
            <td class="px-4 py-3 font-bold text-green-900 font-mono">{{ row.totalKg.toFixed(2) }} Kg</td>
            <td class="px-4 py-3 text-sm text-text">{{ formatCurrency(row.totalRp) }}</td>
          </template>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Printer, Download, FileText } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useFormat } from '../composables/useFormat.js'
import { useExport } from '../composables/useExport.js'
import { transaksiService } from '../services/mock/transaksi.js'
import { nasabahService } from '../services/mock/nasabah.js'
import { sampahService } from '../services/mock/sampah.js'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseTable from '../components/base/BaseTable.vue'
import BaseButton from '../components/base/BaseButton.vue'
import StatusBadge from '../components/base/StatusBadge.vue'

const authStore = useAuthStore()
const { formatCurrency, formatDateTime } = useFormat()
const { exportExcel, exportPDF, printPage } = useExport()

const loading = ref(false)
const activeTab = ref('setoran')
const periodPreset = ref('all')
const startDate = ref('')
const endDate = ref('')

const allTabs = [
  { key: 'setoran', label: 'Laporan Setoran' },
  { key: 'penarikan', label: 'Laporan Penarikan', adminOnly: true },
  { key: 'nasabah', label: 'Laporan Nasabah & Saldo', adminOnly: true },
  { key: 'sampah', label: 'Laporan Jumlah Sampah' },
]

const availableTabs = computed(() => {
  if (authStore.isAdmin) return allTabs
  return allTabs.filter(t => !t.adminOnly)
})

function onPresetChange() {
  const now = new Date()
  if (periodPreset.value === 'today') {
    startDate.value = now.toISOString().split('T')[0]; endDate.value = startDate.value
  } else if (periodPreset.value === '7days') {
    const d = new Date(); d.setDate(d.getDate() - 7)
    startDate.value = d.toISOString().split('T')[0]; endDate.value = now.toISOString().split('T')[0]
  } else if (periodPreset.value === 'month') {
    startDate.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    endDate.value = now.toISOString().split('T')[0]
  } else if (periodPreset.value === 'year') {
    startDate.value = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    endDate.value = now.toISOString().split('T')[0]
  } else {
    startDate.value = ''; endDate.value = ''
  }
}

const currentTabTitle = computed(() => availableTabs.value.find(t => t.key === activeTab.value)?.label || 'Laporan')
const periodLabel = computed(() => (!startDate.value && !endDate.value) ? 'Semua Waktu' : `${startDate.value} s/d ${endDate.value}`)

const reportData = computed(() => {
  if (activeTab.value === 'setoran') {
    return transaksiService.getAll({ tipe: 'setoran', dateStart: startDate.value, dateEnd: endDate.value })
  } else if (activeTab.value === 'penarikan') {
    return transaksiService.getAll({ tipe: 'penarikan', dateStart: startDate.value, dateEnd: endDate.value })
  } else if (activeTab.value === 'nasabah') {
    return nasabahService.getAll()
  } else if (activeTab.value === 'sampah') {
    const allJenis = sampahService.getAll()
    const allItems = transaksiService.getAll({ tipe: 'setoran', status: 'selesai', dateStart: startDate.value, dateEnd: endDate.value })
      .map(t => transaksiService.getItemsByTrxId(t.id)).flat()
    return allJenis.map(j => {
      const matching = allItems.filter(i => i.jenisSampahId === j.id)
      return { id: j.id, nama: j.nama, totalKg: matching.reduce((s, i) => s + (i.berat || 0), 0), totalRp: matching.reduce((s, i) => s + (i.subtotal || 0), 0) }
    })
  }
  return []
})

const currentColumns = computed(() => {
  if (activeTab.value === 'setoran') {
    return [{ key: 'kode', label: 'Kode' }, { key: 'tanggal', label: 'Tanggal' }, { key: 'nasabahNama', label: 'Nasabah' }, { key: 'total', label: 'Total' }, { key: 'petugasNama', label: 'Petugas' }, { key: 'status', label: 'Status' }]
  } else if (activeTab.value === 'penarikan') {
    return [{ key: 'kode', label: 'Kode' }, { key: 'tanggal', label: 'Tanggal' }, { key: 'nasabahNama', label: 'Nasabah' }, { key: 'total', label: 'Nominal' }, { key: 'petugasNama', label: 'Petugas' }, { key: 'status', label: 'Status' }]
  } else if (activeTab.value === 'nasabah') {
    return [{ key: 'kode', label: 'Kode' }, { key: 'nama', label: 'Nama' }, { key: 'telepon', label: 'Telepon' }, { key: 'alamat', label: 'Alamat' }, { key: 'saldo', label: 'Saldo' }, { key: 'status', label: 'Status' }]
  }
  return [{ key: 'nama', label: 'Jenis Sampah' }, { key: 'totalKg', label: 'Total Berat' }, { key: 'totalRp', label: 'Total Nilai Rupiah' }]
})

const summaryCards = computed(() => {
  if (activeTab.value === 'setoran' || activeTab.value === 'penarikan') {
    const totalRp = reportData.value.filter(r => r.status === 'selesai').reduce((s, r) => s + r.total, 0)
    return [{ label: `Total ${activeTab.value === 'setoran' ? 'Setoran' : 'Penarikan'}`, value: formatCurrency(totalRp) }, { label: 'Jumlah Transaksi', value: String(reportData.value.length) }]
  } else if (activeTab.value === 'nasabah') {
    return [{ label: 'Total Nasabah', value: String(reportData.value.length) }, { label: 'Akumulasi Saldo', value: formatCurrency(reportData.value.reduce((s, r) => s + (r.saldo || 0), 0)) }]
  }
  return [{ label: 'Total Berat Sampah', value: `${reportData.value.reduce((s, r) => s + r.totalKg, 0).toFixed(2)} Kg` }, { label: 'Total Nilai Nominal', value: formatCurrency(reportData.value.reduce((s, r) => s + r.totalRp, 0)) }]
})

function handleExportExcel() { exportExcel(reportData.value, currentColumns.value, `Laporan_${activeTab.value}_${Date.now()}`) }
function handleExportPDF() { exportPDF(reportData.value, currentColumns.value, `${currentTabTitle.value} (${periodLabel.value})`, `Laporan_${activeTab.value}`) }
function handlePrint() { printPage() }
</script>

