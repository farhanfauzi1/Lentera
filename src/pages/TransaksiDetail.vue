<template>
  <div>
    <PageHeader :title="`Transaksi ${trx?.kode || ''}`" subtitle="Detail bukti dan rincian transaksi">
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="router.back()">Kembali</BaseButton>
        <BaseButton size="sm" @click="printReceipt"><Printer :size="16" /> Cetak Bukti</BaseButton>
      </template>
    </PageHeader>

    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="animate-spin text-green-900" :size="32" />
    </div>
    <div v-else-if="!trx" class="card text-center py-12 text-muted">
      Transaksi tidak ditemukan.
    </div>
    <div v-else class="max-w-2xl mx-auto">
      <div id="receipt-card" class="card bg-white p-6 sm:p-8 space-y-6">
        <!-- Receipt Header -->
        <div class="text-center border-b pb-6 border-dashed border-gray-300">
          <div class="w-12 h-12 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-2 text-white">
            <Recycle :size="24" />
          </div>
          <h2 class="text-lg font-bold text-text">BANK SAMPAH LENTERE</h2>
          <p class="text-xs text-muted">Kwitansi Transaksi Resmi</p>
          <div class="mt-3 inline-block">
            <StatusBadge :status="trx.status" />
          </div>
          <p v-if="trx.alasanBatal" class="text-xs text-danger mt-2 font-medium">
            Dibatalkan: {{ trx.alasanBatal }}
          </p>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p class="text-muted">Nomor Transaksi</p>
            <p class="font-mono font-bold text-text text-sm">{{ trx.kode }}</p>
            <p class="text-muted mt-2">Waktu Transaksi</p>
            <p class="font-medium text-text">{{ formatDateTime(trx.tanggal) }}</p>
          </div>
          <div class="text-right">
            <p class="text-muted">Nama Nasabah</p>
            <p class="font-semibold text-text text-sm">{{ trx.nasabahNama }}</p>
            <p class="text-muted mt-2">Petugas Pencatat</p>
            <p class="font-medium text-text">{{ trx.petugasNama }}</p>
          </div>
        </div>

        <!-- Items Breakdown (if setoran) -->
        <div v-if="trx.tipe === 'setoran' && items.length > 0" class="border-t border-b border-gray-200 py-4">
          <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Rincian Sampah</p>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-muted text-left border-b border-gray-100 pb-1">
                <th class="py-1">Kategori</th>
                <th class="py-1 text-right">Harga</th>
                <th class="py-1 text-right">Berat / Qty</th>
                <th class="py-1 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="it in items" :key="it.id">
                <td class="py-2 font-medium text-text">{{ it.namaJenis }}</td>
                <td class="py-2 text-right text-muted">{{ formatCurrency(it.harga) }}</td>
                <td class="py-2 text-right font-mono">{{ it.berat }} {{ it.satuan || 'Kg' }}</td>
                <td class="py-2 text-right font-bold text-text">{{ formatCurrency(it.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div class="space-y-2 pt-2">
          <div class="flex justify-between items-center text-sm font-bold">
            <span class="text-text">TOTAL {{ trx.tipe.toUpperCase() }}</span>
            <span :class="trx.tipe === 'setoran' ? 'text-green-900 text-lg' : 'text-danger text-lg'">
              {{ trx.tipe === 'setoran' ? '+' : '-' }} {{ formatCurrency(trx.total) }}
            </span>
          </div>
        </div>

        <!-- Footer Notice -->
        <div class="text-center pt-4 border-t border-dashed border-gray-300 text-[11px] text-muted">
          <p>Terima kasih atas partisipasi Anda dalam program Bank Sampah Lentere.</p>
          <p class="mt-0.5">Bukti ini adalah rekaman sah mutasi saldo tabungan Anda.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Printer, Loader2, Recycle } from 'lucide-vue-next'
import { useFormat } from '../composables/useFormat.js'
import { transaksiService } from '../services/mock/transaksi.js'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseButton from '../components/base/BaseButton.vue'
import StatusBadge from '../components/base/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const { formatCurrency, formatDateTime } = useFormat()

const loading = ref(true)
const trx = ref(null)
const items = ref([])

onMounted(() => {
  const id = route.params.id
  trx.value = transaksiService.getById(id)
  if (trx.value && trx.value.tipe === 'setoran') {
    items.value = transaksiService.getItemsByTrxId(id)
  }
  loading.value = false
})

function printReceipt() {
  window.print()
}
</script>

