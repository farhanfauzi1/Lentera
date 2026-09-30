<template>
  <div>
    <PageHeader title="Dashboard" subtitle="Selamat datang kembali, ringkasan operasional bank sampah">
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="router.push('/nasabah')">
          <UserPlus :size="16" /> Tambah Nasabah
        </BaseButton>
        <BaseButton size="sm" @click="router.push('/setoran/baru')">
          <PackagePlus :size="16" /> Tambah Setoran
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      <StatCard dark title="Total Nasabah" :value="String(stats.totalNasabah)" sub="Nasabah terdaftar" />
      <StatCard title="Total Setoran" :value="formatCurrency(stats.totalSetoran)" sub="Akumulasi setoran" />
      <StatCard title="Total Sampah" :value="`${stats.totalSampah.toFixed(2)} Kg`" sub="Terkumpul" />
      <StatCard title="Total Penarikan" :value="formatCurrency(stats.totalPenarikan)" sub="Akumulasi penarikan" />
      <div class="bg-green-900 rounded-card p-5 sm:col-span-2 xl:col-span-2 flex items-center gap-6">
        <div>
          <p class="text-green-200 text-xs font-semibold uppercase tracking-wider mb-1">Total Saldo Nasabah</p>
          <p class="text-white text-3xl font-bold">{{ formatCurrency(stats.totalSaldo) }}</p>
          <p class="text-green-200 text-xs mt-1">Saldo aktif seluruh nasabah</p>
        </div>
        <Wallet class="text-green-700 ml-auto" :size="48" />
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
      <div class="xl:col-span-2">
        <DepositChart />
      </div>
      <GaugeCard :aktif="stats.nasabahAktif" :nonaktif="stats.nasabahNonaktif" />
    </div>

    <!-- Recent Transactions -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-text">Transaksi Terbaru</h3>
        <router-link to="/transaksi" class="text-sm text-green-900 hover:underline font-medium">Lihat semua</router-link>
      </div>
      <BaseTable :columns="columns" :data="recentTrx" :loading="loading">
        <template #default="{ row }">
          <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
          <td class="px-4 py-3 text-sm">{{ row.nasabahNama || '-' }}</td>
          <td class="px-4 py-3"><StatusBadge :status="row.tipe" /></td>
          <td class="px-4 py-3 text-sm font-medium">{{ formatCurrency(row.total) }}</td>
          <td class="px-4 py-3 text-xs text-muted">{{ formatDate(row.tanggal) }}</td>
          <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
          <td class="px-4 py-3">
            <router-link :to="`/transaksi/${row.id}`" class="text-green-900 hover:underline text-xs font-medium">Detail</router-link>
          </td>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PackagePlus, UserPlus, Wallet } from 'lucide-vue-next'
import { useFormat } from '../composables/useFormat.js'
import { nasabahService } from '../services/mock/nasabah.js'
import { transaksiService } from '../services/mock/transaksi.js'
import PageHeader from '../components/layout/PageHeader.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import DepositChart from '../components/dashboard/DepositChart.vue'
import GaugeCard from '../components/dashboard/GaugeCard.vue'
import BaseTable from '../components/base/BaseTable.vue'
import StatusBadge from '../components/base/StatusBadge.vue'
import BaseButton from '../components/base/BaseButton.vue'

const { formatCurrency, formatDate } = useFormat()
const router = useRouter()
const loading = ref(true)
const stats = ref({ totalNasabah: 0, totalSetoran: 0, totalSampah: 0, totalPenarikan: 0, totalSaldo: 0, nasabahAktif: 0, nasabahNonaktif: 0 })
const recentTrx = ref([])

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nasabahNama', label: 'Nasabah' },
  { key: 'tipe', label: 'Jenis' },
  { key: 'total', label: 'Nominal' },
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: '' },
]

onMounted(() => {
  const allNasabah = nasabahService.getAll()
  const aktif = allNasabah.filter(n => n.status === 'aktif')
  const nonaktif = allNasabah.filter(n => n.status === 'nonaktif')
  const trxStats = transaksiService.getStats()
  const totalSaldo = aktif.reduce((s, n) => s + (n.saldo || 0), 0)

  stats.value = {
    totalNasabah: allNasabah.length,
    nasabahAktif: aktif.length,
    nasabahNonaktif: nonaktif.length,
    totalSaldo,
    ...trxStats,
  }

  recentTrx.value = transaksiService.getAll({}).slice(0, 8)
  loading.value = false
})
</script>
