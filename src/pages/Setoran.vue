<template>
  <div>
    <PageHeader title="Form Setoran Sampah" subtitle="Catat setoran sampah nasabah dan konversi menjadi saldo">
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="resetForm"><RotateCcw :size="16" /> Reset</BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 flex flex-col gap-5">
        <div class="card">
          <h3 class="font-semibold text-text mb-3">1. Pilih Nasabah</h3>
          <BaseSelect v-model="selectedNasabahId" label="Nasabah Aktif" placeholder="-- Pilih Nasabah --" required :error="errors.nasabah">
            <option v-for="n in activeNasabahList" :key="n.id" :value="n.id">
              {{ n.kode }} — {{ n.nama }} (Saldo: {{ formatCurrency(n.saldo) }})
            </option>
          </BaseSelect>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-text">2. Rincian Sampah</h3>
            <BaseButton size="sm" variant="outline" @click="addItem"><Plus :size="15" /> Tambah Baris</BaseButton>
          </div>
          <p v-if="errors.items" class="text-xs text-danger mb-3">{{ errors.items }}</p>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 border-b border-border text-xs text-muted font-semibold uppercase">
                <tr>
                  <th class="px-3 py-2.5">Jenis Sampah</th>
                  <th class="px-3 py-2.5 w-32">Harga</th>
                  <th class="px-3 py-2.5 w-32">Berat / Qty</th>
                  <th class="px-3 py-2.5 w-36">Subtotal</th>
                  <th class="px-2 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="(item, index) in items" :key="index">
                  <td class="px-3 py-2.5">
                    <select v-model="item.jenisSampahId" class="input-field py-1.5 text-sm" @change="onJenisChange(item)">
                      <option value="" disabled>-- Pilih Jenis --</option>
                      <option v-for="j in activeJenisList" :key="j.id" :value="j.id">
                        {{ j.nama }} ({{ formatCurrency(j.harga) }}/{{ j.satuan || 'Kg' }})
                      </option>
                    </select>
                  </td>
                  <td class="px-3 py-2.5 font-medium">{{ item.harga ? `${formatCurrency(item.harga)}/${item.satuan || 'Kg'}` : '-' }}</td>
                  <td class="px-3 py-2.5">
                    <input v-model.number="item.berat" type="number" step="0.1" min="0.1" placeholder="0.0" class="input-field py-1.5 text-sm w-full" @input="calcSubtotal(item)" />
                  </td>
                  <td class="px-3 py-2.5 font-bold text-green-900">{{ formatCurrency(item.subtotal) }}</td>
                  <td class="px-2 py-2.5 text-center">
                    <button v-if="items.length > 1" @click="removeItem(index)" class="p-1 text-muted hover:text-danger rounded"><Trash2 :size="16" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="card sticky top-20">
          <h3 class="font-semibold text-text mb-4">Ringkasan Setoran</h3>
          <div class="space-y-3 text-sm pb-4 border-b border-border">
            <div class="flex justify-between"><span class="text-muted">Nasabah</span><span class="font-medium text-text">{{ selectedNasabah?.nama || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-muted">Saldo Saat Ini</span><span class="text-text font-medium">{{ formatCurrency(selectedNasabah?.saldo || 0) }}</span></div>
            <div class="flex justify-between text-green-900 font-semibold"><span>Penambahan</span><span>+ {{ formatCurrency(grandTotal) }}</span></div>
          </div>
          <div class="py-4 border-b border-border flex justify-between items-baseline">
            <span class="text-sm font-semibold">Estimasi Saldo Akhir</span>
            <span class="text-xl font-bold text-green-900">{{ formatCurrency((selectedNasabah?.saldo || 0) + grandTotal) }}</span>
          </div>
          <div class="pt-4 flex flex-col gap-3">
            <BaseButton class="w-full justify-center" size="lg" :loading="saving" :disabled="!isValidForm" @click="handleSave">
              <Check :size="18" /> Simpan Setoran
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <BaseModal v-model="showReceiptModal" title="Bukti Transaksi Setoran" size="md">
      <div id="receipt-print-area" class="p-4 bg-white text-text font-sans">
        <div class="text-center pb-3 border-b border-dashed border-gray-300">
          <h2 class="text-base font-bold text-green-900">BANK SAMPAH LENTERE</h2>
          <p class="text-xs text-muted">Kode: {{ latestReceipt?.kode }}</p>
          <p class="text-xs text-muted">Tanggal: {{ formatDateTime(latestReceipt?.tanggal) }}</p>
        </div>
        <div class="py-2 text-xs border-b border-dashed border-gray-300">
          <p>Nasabah: <strong>{{ latestReceipt?.nasabahNama }}</strong> ({{ latestReceipt?.nasabahKode }})</p>
          <p>Petugas: <strong>{{ latestReceipt?.petugasNama }}</strong></p>
        </div>
        <div class="py-3">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b text-muted text-left">
                <th class="py-1">Jenis</th>
                <th class="py-1 text-right">Berat</th>
                <th class="py-1 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in latestReceipt?.items" :key="it.id">
                <td class="py-1">{{ it.namaJenis }}</td>
                <td class="py-1 text-right font-mono">{{ it.berat }} {{ it.satuan || 'Kg' }}</td>
                <td class="py-1 text-right font-semibold">{{ formatCurrency(it.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pt-2 border-t border-dashed border-gray-300 text-xs flex justify-between font-bold text-green-900">
          <span>TOTAL SETORAN</span>
          <span>{{ formatCurrency(latestReceipt?.total) }}</span>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2 justify-end no-print">
          <BaseButton variant="ghost" @click="showReceiptModal = false">Tutup</BaseButton>
          <BaseButton @click="printReceipt"><Printer :size="16" /> Cetak Bukti</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Plus, Trash2, Check, RotateCcw, Printer } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { useFormat } from '../composables/useFormat.js'
import { nasabahService } from '../services/mock/nasabah.js'
import { sampahService } from '../services/mock/sampah.js'
import { transaksiService } from '../services/mock/transaksi.js'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { formatCurrency, formatDateTime } = useFormat()

const activeNasabahList = ref([])
const activeJenisList = ref([])

const selectedNasabahId = ref('')
const selectedNasabah = computed(() => activeNasabahList.value.find(n => n.id === selectedNasabahId.value) || null)

const items = ref([
  { jenisSampahId: '', namaJenis: '', harga: 0, berat: 1, satuan: 'Kg', subtotal: 0 }
])

const errors = reactive({ nasabah: '', items: '' })
const saving = ref(false)
const showReceiptModal = ref(false)
const latestReceipt = ref(null)

function loadData() {
  activeNasabahList.value = nasabahService.getAktif()
  activeJenisList.value = sampahService.getAktif()
}

onMounted(loadData)

function addItem() {
  items.value.push({ jenisSampahId: '', namaJenis: '', harga: 0, berat: 1, satuan: 'Kg', subtotal: 0 })
}

function removeItem(index) {
  if (items.value.length > 1) items.value.splice(index, 1)
}

function onJenisChange(item) {
  const found = activeJenisList.value.find(j => j.id === item.jenisSampahId)
  if (found) {
    item.namaJenis = found.nama
    item.harga = found.harga
    item.satuan = found.satuan || 'Kg'
    calcSubtotal(item)
  }
}

function calcSubtotal(item) {
  item.subtotal = Math.round((item.berat || 0) * (item.harga || 0))
}

const grandTotal = computed(() => items.value.reduce((s, it) => s + (it.subtotal || 0), 0))
const isValidForm = computed(() => {
  return selectedNasabahId.value && items.value.length > 0 && items.value.every(it => it.jenisSampahId && it.berat > 0) && grandTotal.value > 0
})

function resetForm() {
  selectedNasabahId.value = ''
  items.value = [{ jenisSampahId: '', namaJenis: '', harga: 0, berat: 1, satuan: 'Kg', subtotal: 0 }]
  errors.nasabah = ''
  errors.items = ''
}

async function handleSave() {
  errors.nasabah = selectedNasabahId.value ? '' : 'Nasabah wajib dipilih'
  const invalidItems = items.value.some(it => !it.jenisSampahId || it.berat <= 0)
  errors.items = invalidItems ? 'Semua baris jenis sampah dan berat harus valid (>0)' : ''
  if (errors.nasabah || errors.items) return

  saving.value = true
  try {
    const payload = {
      nasabahId: selectedNasabah.value.id,
      nasabahNama: selectedNasabah.value.nama,
      nasabahKode: selectedNasabah.value.kode,
      petugasId: authStore.user?.id || '1',
      petugasNama: authStore.user?.nama || 'Petugas',
      items: items.value.map(it => ({
        jenisSampahId: it.jenisSampahId,
        namaJenis: it.namaJenis,
        berat: it.berat,
        harga: it.harga,
        satuan: it.satuan,
        subtotal: it.subtotal,
      })),
    }

    const created = transaksiService.createSetoran(payload)
    latestReceipt.value = created
    showReceiptModal.value = true
    uiStore.showToast(`Setoran ${formatCurrency(created.total)} berhasil disimpan`)
    loadData()
    resetForm()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    saving.value = false
  }
}

function printReceipt() {
  window.print()
}
</script>

