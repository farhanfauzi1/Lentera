<template>
  <div>
    <PageHeader title="Jenis Sampah" subtitle="Daftar kategori dan harga sampah yang diterima">
      <template #actions>
        <BaseButton v-if="canManage" @click="openModal()">
          <Plus :size="16" /> Tambah Jenis Sampah
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="card mb-4 flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-48">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" :size="16" />
        <input v-model="search" type="text" placeholder="Cari jenis sampah..." class="input-field pl-9" />
      </div>
      <select v-model="filterStatus" class="input-field w-auto">
        <option value="">Semua Status</option>
        <option value="aktif">Aktif</option>
        <option value="nonaktif">Nonaktif</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card">
      <BaseTable :columns="columns" :data="paginatedItems" :loading="loading">
        <template #default="{ row }">
          <td class="px-4 py-3 font-medium text-text">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-900">
                <Recycle :size="16" />
              </div>
              <span>{{ row.nama }}</span>
            </div>
          </td>
          <td class="px-4 py-3 font-semibold text-green-900">
            {{ formatCurrency(row.harga) }} / {{ row.satuan || 'Kg' }}
          </td>
          <td class="px-4 py-3 text-sm text-muted">
            {{ row.satuan || 'Kg' }}
          </td>
          <td class="px-4 py-3">
            <StatusBadge :status="row.status" />
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-1" v-if="canManage">
              <button
                @click="openModal(row)"
                class="p-1.5 rounded-lg hover:bg-green-50 text-muted hover:text-green-900 transition"
                title="Edit"
              >
                <Pencil :size="15" />
              </button>
              <button
                @click="toggleStatus(row)"
                class="p-1.5 rounded-lg hover:bg-yellow-50 text-muted hover:text-yellow-700 transition"
                :title="row.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'"
              >
                <ToggleLeft v-if="row.status !== 'aktif'" :size="15" />
                <ToggleRight v-else :size="15" class="text-green-900" />
              </button>
              <button
                @click="confirmDelete(row)"
                class="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-danger transition"
                title="Hapus"
              >
                <Trash2 :size="15" />
              </button>
            </div>
            <span v-else class="text-xs text-muted">Hanya lihat</span>
          </td>
        </template>
      </BaseTable>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p class="text-xs text-muted">{{ paginatedItems.length }} dari {{ filteredItems.length }} kategori</p>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @prev="prevPage"
          @next="nextPage"
          @goto="goToPage"
        />
      </div>
    </div>

    <!-- Modal Form -->
    <BaseModal v-model="showModal" :title="editData ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah'" size="md">
      <form @submit.prevent="handleSave" class="flex flex-col gap-4">
        <BaseInput
          v-model="form.nama"
          label="Nama Kategori Sampah"
          placeholder="Contoh: Botol Plastik"
          required
          :error="formErrors.nama"
        />
        <BaseInput
          v-model.number="form.harga"
          label="Harga per Satuan (Rp)"
          type="number"
          min="1"
          placeholder="Contoh: 4000"
          required
          :error="formErrors.harga"
        />
        <BaseSelect v-model="form.satuan" label="Satuan">
          <option value="Kg">Kg (Kilogram)</option>
          <option value="Pcs">Pcs (Satuan/Biji)</option>
          <option value="Liter">Liter</option>
        </BaseSelect>
        <BaseSelect v-model="form.status" label="Status">
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </BaseSelect>
      </form>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <BaseButton variant="ghost" @click="showModal = false">Batal</BaseButton>
          <BaseButton :loading="saving" @click="handleSave">Simpan</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Modal -->
    <BaseModal v-model="showDeleteModal" title="Hapus Jenis Sampah" size="sm">
      <p class="text-sm text-text">
        Hapus jenis sampah <strong>{{ deleteTarget?.nama }}</strong>? Kategori yang sudah memiliki transaksi akan otomatis dinonaktifkan.
      </p>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <BaseButton variant="ghost" @click="showDeleteModal = false">Batal</BaseButton>
          <BaseButton variant="danger" :loading="deleting" @click="handleDelete">Hapus</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, Recycle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { useFormat } from '../composables/useFormat.js'
import { usePagination } from '../composables/usePagination.js'
import { sampahService } from '../services/mock/sampah.js'
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
const { formatCurrency } = useFormat()

const canManage = computed(() => authStore.user?.role === 'admin')
const loading = ref(false)
const list = ref([])
const search = ref('')
const filterStatus = ref('')

const columns = [
  { key: 'nama', label: 'Jenis Sampah' },
  { key: 'harga', label: 'Harga / Satuan' },
  { key: 'satuan', label: 'Satuan' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
]

const filteredItems = computed(() => {
  let data = list.value
  if (filterStatus.value) data = data.filter(j => j.status === filterStatus.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(j => j.nama.toLowerCase().includes(q))
  }
  return data
})

const { currentPage, totalPages, paginatedItems, prevPage, nextPage, goToPage, resetPage } = usePagination(filteredItems, 10)
watch([search, filterStatus], resetPage)

function loadData() {
  loading.value = true
  list.value = sampahService.getAll()
  loading.value = false
}
loadData()

const showModal = ref(false)
const editData = ref(null)
const saving = ref(false)
const form = reactive({ nama: '', harga: 1000, satuan: 'Kg', status: 'aktif' })
const formErrors = reactive({ nama: '', harga: '' })

function openModal(row = null) {
  editData.value = row
  formErrors.nama = ''
  formErrors.harga = ''
  if (row) {
    Object.assign(form, { nama: row.nama, harga: row.harga, satuan: row.satuan || 'Kg', status: row.status })
  } else {
    Object.assign(form, { nama: '', harga: 1000, satuan: 'Kg', status: 'aktif' })
  }
  showModal.value = true
}

async function handleSave() {
  formErrors.nama = form.nama ? '' : 'Nama jenis sampah wajib diisi'
  formErrors.harga = form.harga > 0 ? '' : 'Harga harus lebih dari 0'
  if (formErrors.nama || formErrors.harga) return

  saving.value = true
  try {
    if (editData.value) {
      sampahService.update(editData.value.id, form)
      uiStore.showToast('Jenis sampah berhasil diperbarui')
    } else {
      sampahService.create(form)
      uiStore.showToast('Jenis sampah berhasil ditambahkan')
    }
    showModal.value = false
    loadData()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    saving.value = false
  }
}

const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

function confirmDelete(row) {
  deleteTarget.value = row
  showDeleteModal.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    const hasTrx = transaksiService.getAll({ jenisSampahId: deleteTarget.value.id }).length > 0
    if (hasTrx) {
      sampahService.update(deleteTarget.value.id, { status: 'nonaktif' })
      uiStore.showToast('Jenis sampah memiliki transaksi, dinonaktifkan saja', 'warning')
    } else {
      sampahService.delete(deleteTarget.value.id)
      uiStore.showToast('Jenis sampah berhasil dihapus')
    }
    showDeleteModal.value = false
    loadData()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    deleting.value = false
  }
}

function toggleStatus(row) {
  try {
    sampahService.toggleStatus(row.id)
    loadData()
    uiStore.showToast(`Jenis sampah ${row.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan'}`)
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}
</script>

