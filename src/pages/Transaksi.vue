<template>
  <div>
    <PageHeader title="Riwayat Transaksi" subtitle="Daftar semua transaksi setoran dan penarikan">
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="resetFilters">
          <RotateCcw :size="16" /> Reset Filter
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters Bar -->
    <div class="card mb-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" :size="16" />
          <input v-model="filters.search" type="text" placeholder="Cari kode / nama..." class="input-field pl-9" />
        </div>

        <select v-model="filters.tipe" class="input-field">
          <option value="">Semua Tipe Transaksi</option>
          <option value="setoran">Setoran</option>
          <option value="penarikan">Penarikan</option>
        </select>

        <select v-model="filters.status" class="input-field">
          <option value="">Semua Status</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>

        <select v-model="filters.nasabahId" class="input-field">
          <option value="">Semua Nasabah</option>
          <option v-for="n in nasabahList" :key="n.id" :value="n.id">{{ n.nama }}</option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted w-16">Dari:</span>
          <input v-model="filters.dateStart" type="date" class="input-field py-1 text-sm" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted w-16">Sampai:</span>
          <input v-model="filters.dateEnd" type="date" class="input-field py-1 text-sm" />
        </div>
        <select v-model="filters.jenisSampahId" class="input-field py-1 text-sm">
          <option value="">Semua Kategori Sampah</option>
          <option v-for="j in jenisList" :key="j.id" :value="j.id">{{ j.nama }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <BaseTable :columns="columns" :data="paginatedItems" :loading="loading">
        <template #default="{ row }">
          <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
          <td class="px-4 py-3 text-xs text-muted">{{ formatDateTime(row.tanggal) }}</td>
          <td class="px-4 py-3 font-medium text-text">{{ row.nasabahNama }}</td>
          <td class="px-4 py-3"><StatusBadge :status="row.tipe" /></td>
          <td class="px-4 py-3 font-bold" :class="row.tipe === 'setoran' ? 'text-green-900' : 'text-danger'">
            {{ row.tipe === 'setoran' ? '+' : '-' }} {{ formatCurrency(row.total) }}
          </td>
          <td class="px-4 py-3 text-xs text-muted">{{ row.petugasNama }}</td>
          <td class="px-4 py-3">
            <StatusBadge :status="row.status" />
            <p v-if="row.alasanBatal" class="text-[10px] text-danger mt-0.5 truncate max-w-xs" :title="row.alasanBatal">
              Alasan: {{ row.alasanBatal }}
            </p>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <router-link :to="`/transaksi/${row.id}`" class="text-green-900 hover:underline text-xs font-medium">
                Detail
              </router-link>
              <button
                v-if="canCancel && row.status === 'selesai'"
                @click="openCancelModal(row)"
                class="text-danger hover:underline text-xs font-medium"
              >
                Batalkan
              </button>
            </div>
          </td>
        </template>
      </BaseTable>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p class="text-xs text-muted">{{ paginatedItems.length }} dari {{ filteredList.length }} transaksi</p>
        <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prevPage" @next="nextPage" @goto="goToPage" />
      </div>
    </div>

    <!-- Cancel Modal -->
    <BaseModal v-model="showCancelModal" title="Batalkan Transaksi" size="md">
      <div class="space-y-4">
        <p class="text-sm text-text">
          Anda akan membatalkan transaksi <strong>{{ cancelTarget?.kode }}</strong>. Saldo nasabah akan dikoreksi otomatis.
        </p>
        <BaseInput
          v-model="cancelReason"
          label="Alasan Pembatalan"
          placeholder="Tuliskan alasan pembatalan..."
          required
        />
      </div>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <BaseButton variant="ghost" @click="showCancelModal = false">Tutup</BaseButton>
          <BaseButton variant="danger" :loading="cancelling" :disabled="!cancelReason" @click="handleCancel">
            Konfirmasi Batal
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, RotateCcw } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { useFormat } from '../composables/useFormat.js'
import { usePagination } from '../composables/usePagination.js'
import { nasabahService } from '../services/mock/nasabah.js'
import { sampahService } from '../services/mock/sampah.js'
import { transaksiService } from '../services/mock/transaksi.js'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseTable from '../components/base/BaseTable.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import StatusBadge from '../components/base/StatusBadge.vue'
import Pagination from '../components/base/Pagination.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { formatCurrency, formatDateTime } = useFormat()

const canCancel = computed(() => authStore.user?.role === 'admin')
const loading = ref(false)
const nasabahList = ref([])
const jenisList = ref([])

const filters = reactive({
  search: route.query.search || '',
  tipe: route.query.tipe || '',
  status: route.query.status || '',
  nasabahId: route.query.nasabahId || '',
  jenisSampahId: route.query.jenisSampahId || '',
  dateStart: route.query.dateStart || '',
  dateEnd: route.query.dateEnd || '',
})

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'nasabahNama', label: 'Nasabah' },
  { key: 'tipe', label: 'Tipe' },
  { key: 'total', label: 'Nominal' },
  { key: 'petugasNama', label: 'Petugas' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
]

const filteredList = computed(() => {
  return transaksiService.getAll({
    search: filters.search,
    tipe: filters.tipe,
    status: filters.status,
    nasabahId: filters.nasabahId,
    jenisSampahId: filters.jenisSampahId,
    dateStart: filters.dateStart,
    dateEnd: filters.dateEnd,
  })
})

const { currentPage, totalPages, paginatedItems, prevPage, nextPage, goToPage, resetPage } = usePagination(filteredList, 10)

watch(filters, () => {
  resetPage()
  router.replace({
    query: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
  })
}, { deep: true })

function loadInitial() {
  nasabahList.value = nasabahService.getAll()
  jenisList.value = sampahService.getAll()
}

onMounted(loadInitial)

function resetFilters() {
  Object.assign(filters, { search: '', tipe: '', status: '', nasabahId: '', jenisSampahId: '', dateStart: '', dateEnd: '' })
}

const showCancelModal = ref(false)
const cancelTarget = ref(null)
const cancelReason = ref('')
const cancelling = ref(false)

function openCancelModal(row) {
  cancelTarget.value = row
  cancelReason.value = ''
  showCancelModal.value = true
}

async function handleCancel() {
  cancelling.value = true
  try {
    transaksiService.cancelTransaction(cancelTarget.value.id, cancelReason.value)
    uiStore.showToast('Transaksi berhasil dibatalkan dan saldo dikoreksi')
    showCancelModal.value = false
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    cancelling.value = false
  }
}
</script>

