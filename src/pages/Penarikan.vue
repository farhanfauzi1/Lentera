<template>
  <div>
    <PageHeader title="Penarikan Saldo" subtitle="Kelola pencairan saldo tabungan sampah nasabah" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Form Input -->
      <div class="lg:col-span-2 card">
        <h3 class="font-semibold text-text mb-4">Form Penarikan</h3>
        <form @submit.prevent="openConfirm" class="flex flex-col gap-4">
          <BaseSelect
            v-model="selectedNasabahId"
            label="Pilih Nasabah"
            placeholder="-- Pilih Nasabah --"
            required
            :error="formErrors.nasabah"
          >
            <option v-for="n in activeNasabahList" :key="n.id" :value="n.id">
              {{ n.kode }} — {{ n.nama }} (Saldo: {{ formatCurrency(n.saldo) }})
            </option>
          </BaseSelect>

          <div v-if="selectedNasabah" class="bg-green-50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p class="text-xs text-green-700 font-semibold uppercase">Saldo Tersedia</p>
              <p class="text-2xl font-bold text-green-900">{{ formatCurrency(selectedNasabah.saldo) }}</p>
            </div>
            <BaseButton size="sm" variant="outline" type="button" @click="tarikSemua">
              Tarik Semua
            </BaseButton>
          </div>

          <BaseInput
            v-model.number="nominal"
            label="Nominal Penarikan (Rp)"
            type="number"
            min="1000"
            step="1000"
            placeholder="Contoh: 50000"
            required
            :error="formErrors.nominal"
            :hint="nominal ? `Terbilang: ${formatCurrency(nominal)}` : ''"
          />

          <BaseButton
            type="submit"
            size="lg"
            class="w-full justify-center mt-2"
            :disabled="!isValidForm"
          >
            <Wallet :size="18" /> Lanjutkan Penarikan
          </BaseButton>
        </form>
      </div>

      <!-- Quick Info -->
      <div class="card bg-surface flex flex-col justify-between">
        <div>
          <h3 class="font-semibold text-text mb-3">Ketentuan Penarikan</h3>
          <ul class="text-xs text-muted space-y-2 list-disc pl-4">
            <li>Nasabah harus dalam status <strong>aktif</strong>.</li>
            <li>Nominal penarikan tidak boleh melebihi saldo tabungan saat ini.</li>
            <li>Transaksi penarikan yang sudah disimpan akan memotong saldo seketika.</li>
            <li>Admin dapat membatalkan transaksi jika terjadi kesalahan input.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Riwayat Penarikan -->
    <div class="card">
      <h3 class="font-semibold text-text mb-4">Riwayat Penarikan Saldo</h3>
      <BaseTable :columns="columns" :data="paginatedItems" :loading="loading">
        <template #default="{ row }">
          <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
          <td class="px-4 py-3 font-medium text-text">{{ row.nasabahNama }}</td>
          <td class="px-4 py-3 font-bold text-danger">- {{ formatCurrency(row.total) }}</td>
          <td class="px-4 py-3 text-xs text-muted">{{ formatDateTime(row.tanggal) }}</td>
          <td class="px-4 py-3 text-xs text-muted">{{ row.petugasNama }}</td>
          <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
          <td class="px-4 py-3">
            <router-link :to="`/transaksi/${row.id}`" class="text-green-900 hover:underline text-xs">Detail</router-link>
          </td>
        </template>
      </BaseTable>
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p class="text-xs text-muted">{{ paginatedItems.length }} dari {{ list.length }} penarikan</p>
        <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prevPage" @next="nextPage" @goto="goToPage" />
      </div>
    </div>

    <!-- Confirm Modal -->
    <BaseModal v-model="showConfirmModal" title="Konfirmasi Penarikan Saldo" size="md">
      <div class="space-y-4 text-sm">
        <p class="text-text">Pastikan data penarikan saldo berikut sudah benar:</p>
        <div class="bg-gray-50 p-4 rounded-xl space-y-2">
          <div class="flex justify-between"><span class="text-muted">Nasabah:</span><span class="font-medium text-text">{{ selectedNasabah?.nama }}</span></div>
          <div class="flex justify-between"><span class="text-muted">Saldo Awal:</span><span class="font-medium text-text">{{ formatCurrency(selectedNasabah?.saldo || 0) }}</span></div>
          <div class="flex justify-between text-danger font-semibold"><span>Jumlah Penarikan:</span><span>- {{ formatCurrency(nominal) }}</span></div>
          <div class="flex justify-between border-t border-border pt-2 font-bold text-green-900">
            <span>Sisa Saldo:</span><span>{{ formatCurrency((selectedNasabah?.saldo || 0) - nominal) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <BaseButton variant="ghost" @click="showConfirmModal = false">Batal</BaseButton>
          <BaseButton :loading="submitting" @click="handleSubmit">Konfirmasi & Simpan</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Wallet } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { useFormat } from '../composables/useFormat.js'
import { usePagination } from '../composables/usePagination.js'
import { nasabahService } from '../services/mock/nasabah.js'
import { transaksiService } from '../services/mock/transaksi.js'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseTable from '../components/base/BaseTable.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import StatusBadge from '../components/base/StatusBadge.vue'
import Pagination from '../components/base/Pagination.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { formatCurrency, formatDateTime } = useFormat()

const activeNasabahList = ref([])
const selectedNasabahId = ref('')
const selectedNasabah = computed(() => activeNasabahList.value.find(n => n.id === selectedNasabahId.value) || null)

const nominal = ref(null)
const formErrors = reactive({ nasabah: '', nominal: '' })

const loading = ref(false)
const list = ref([])
const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'nasabahNama', label: 'Nasabah' },
  { key: 'total', label: 'Nominal' },
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'petugasNama', label: 'Petugas' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: '' },
]

const { currentPage, totalPages, paginatedItems, prevPage, nextPage, goToPage } = usePagination(list, 10)

function loadData() {
  loading.value = true
  activeNasabahList.value = nasabahService.getAktif()
  list.value = transaksiService.getAll({ tipe: 'penarikan' })
  loading.value = false
}

onMounted(loadData)

function tarikSemua() {
  if (selectedNasabah.value) nominal.value = selectedNasabah.value.saldo
}

const isValidForm = computed(() => {
  return selectedNasabah.value && nominal.value > 0 && nominal.value <= selectedNasabah.value.saldo
})

const showConfirmModal = ref(false)
const submitting = ref(false)

function openConfirm() {
  formErrors.nasabah = selectedNasabahId.value ? '' : 'Nasabah wajib dipilih'
  if (!nominal.value || nominal.value <= 0) {
    formErrors.nominal = 'Nominal harus lebih dari 0'
  } else if (selectedNasabah.value && nominal.value > selectedNasabah.value.saldo) {
    formErrors.nominal = 'Nominal melebihi saldo nasabah'
  } else {
    formErrors.nominal = ''
  }

  if (formErrors.nasabah || formErrors.nominal) return
  showConfirmModal.value = true
}

async function handleSubmit() {
  submitting.value = true
  try {
    transaksiService.createPenarikan({
      nasabahId: selectedNasabah.value.id,
      nasabahNama: selectedNasabah.value.nama,
      nasabahKode: selectedNasabah.value.kode,
      petugasId: authStore.user?.id || '1',
      petugasNama: authStore.user?.nama || 'Petugas',
      nominal: nominal.value,
    })

    uiStore.showToast(`Penarikan ${formatCurrency(nominal.value)} berhasil diproses`)
    showConfirmModal.value = false
    selectedNasabahId.value = ''
    nominal.value = null
    loadData()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

