<template>
  <div>
    <PageHeader title="Nasabah" subtitle="Kelola data nasabah bank sampah">
      <template #actions>
        <BaseButton v-if="canCreate" @click="openModal()">
          <Plus :size="16" /> Tambah Nasabah
        </BaseButton>
      </template>
    </PageHeader>

    <div class="card mb-4 flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-48">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" :size="16" />
        <input v-model="search" type="text" placeholder="Cari nama, kode, telepon..." class="input-field pl-9" />
      </div>
      <select v-model="filterStatus" class="input-field w-auto">
        <option value="">Semua Status</option>
        <option value="aktif">Aktif</option>
        <option value="nonaktif">Nonaktif</option>
      </select>
    </div>

    <div class="card">
      <BaseTable :columns="columns" :data="paginatedItems" :loading="loading">
        <template #default="{ row }">
          <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-900 text-xs font-bold flex-shrink-0">{{ row.nama[0].toUpperCase() }}</div>
              <div><p class="text-sm font-medium text-text">{{ row.nama }}</p><p class="text-xs text-muted">{{ row.telepon }}</p></div>
            </div>
          </td>
          <td class="px-4 py-3 text-sm text-muted">{{ row.alamat }}</td>
          <td class="px-4 py-3 text-sm font-semibold text-green-900">{{ formatCurrency(row.saldo) }}</td>
          <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-1">
              <router-link :to="`/nasabah/${row.id}`"><button class="p-1.5 rounded-lg hover:bg-green-50 text-muted hover:text-green-900 transition" title="Detail"><Eye :size="15" /></button></router-link>
              <button v-if="canEdit" @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-green-50 text-muted hover:text-green-900 transition" title="Edit"><Pencil :size="15" /></button>
              <button @click="toggleStatus(row)" class="p-1.5 rounded-lg hover:bg-yellow-50 text-muted hover:text-yellow-700 transition"><ToggleLeft v-if="row.status !== 'aktif'" :size="15" /><ToggleRight v-else :size="15" class="text-green-900" /></button>
              <button v-if="canDelete" @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-danger transition" title="Hapus"><Trash2 :size="15" /></button>
            </div>
          </td>
        </template>
      </BaseTable>
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p class="text-xs text-muted">{{ paginatedItems.length }} dari {{ filteredItems.length }} nasabah</p>
        <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prevPage" @next="nextPage" @goto="goToPage" />
      </div>
    </div>

    <BaseModal v-model="showModal" :title="editData ? 'Edit Nasabah' : 'Tambah Nasabah'" size="md">
      <form @submit.prevent="handleSave" class="flex flex-col gap-4">
        <BaseInput v-model="form.nama" label="Nama Lengkap" placeholder="Nama nasabah" required :error="formErrors.nama" />
        <BaseInput v-model="form.nik" label="NIK (Opsional)" placeholder="Nomor Induk Kependudukan" />
        <BaseInput v-model="form.telepon" label="Nomor Telepon" placeholder="08xxxxxxxxxx" />
        <BaseInput v-model="form.alamat" label="Alamat" placeholder="Alamat lengkap" />
        <BaseInput v-model="form.tanggalBergabung" label="Tanggal Bergabung" type="date" />
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

    <BaseModal v-model="showDeleteModal" title="Hapus Nasabah" size="sm">
      <p class="text-sm text-text">Hapus nasabah <strong>{{ deleteTarget?.nama }}</strong>? Jika ada transaksi, nasabah hanya akan dinonaktifkan.</p>
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
import { Plus, Search, Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-vue-next'
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
const { formatCurrency } = useFormat()

const canCreate = computed(() => ['admin', 'petugas'].includes(authStore.user?.role))
const canEdit = computed(() => ['admin', 'petugas'].includes(authStore.user?.role))
const canDelete = computed(() => authStore.user?.role === 'admin')

const loading = ref(false)
const list = ref([])
const search = ref('')
const filterStatus = ref('')
const columns = [
  { key: 'kode', label: 'Kode' }, { key: 'nama', label: 'Nasabah' },
  { key: 'alamat', label: 'Alamat' }, { key: 'saldo', label: 'Saldo' },
  { key: 'status', label: 'Status' }, { key: 'aksi', label: 'Aksi' },
]

const filteredItems = computed(() => {
  let data = list.value
  if (filterStatus.value) data = data.filter(n => n.status === filterStatus.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter(n => n.nama.toLowerCase().includes(q) || n.kode.toLowerCase().includes(q) || (n.telepon && n.telepon.includes(q)))
  }
  return data
})

const { currentPage, totalPages, paginatedItems, prevPage, nextPage, goToPage, resetPage } = usePagination(filteredItems, 10)
watch([search, filterStatus], resetPage)

function loadData() { loading.value = true; list.value = nasabahService.getAll(); loading.value = false }
loadData()

const showModal = ref(false), editData = ref(null), saving = ref(false)
const form = reactive({ nama: '', nik: '', telepon: '', alamat: '', tanggalBergabung: '', status: 'aktif' })
const formErrors = reactive({ nama: '' })

function openModal(row = null) {
  editData.value = row
  formErrors.nama = ''
  if (row) Object.assign(form, { nama: row.nama, nik: row.nik || '', telepon: row.telepon || '', alamat: row.alamat || '', tanggalBergabung: row.tanggalBergabung || '', status: row.status })
  else Object.assign(form, { nama: '', nik: '', telepon: '', alamat: '', tanggalBergabung: new Date().toISOString().split('T')[0], status: 'aktif' })
  showModal.value = true
}

async function handleSave() {
  formErrors.nama = form.nama ? '' : 'Nama wajib diisi'
  if (formErrors.nama) return
  saving.value = true
  try {
    if (editData.value) nasabahService.update(editData.value.id, form)
    else nasabahService.create(form)
    showModal.value = false; loadData()
    uiStore.showToast(editData.value ? 'Nasabah berhasil diperbarui' : 'Nasabah berhasil ditambahkan')
  } catch (e) { uiStore.showToast(e.message, 'error') } finally { saving.value = false }
}

const showDeleteModal = ref(false), deleteTarget = ref(null), deleting = ref(false)
function confirmDelete(row) { deleteTarget.value = row; showDeleteModal.value = true }

async function handleDelete() {
  deleting.value = true
  try {
    const trx = transaksiService.getByNasabahId(deleteTarget.value.id)
    if (trx.length > 0) { nasabahService.update(deleteTarget.value.id, { status: 'nonaktif' }); uiStore.showToast('Nasabah dinonaktifkan karena memiliki transaksi', 'warning') }
    else { nasabahService.delete(deleteTarget.value.id); uiStore.showToast('Nasabah berhasil dihapus') }
    showDeleteModal.value = false; loadData()
  } catch (e) { uiStore.showToast(e.message, 'error') } finally { deleting.value = false }
}

function toggleStatus(row) {
  try { nasabahService.toggleStatus(row.id); loadData(); uiStore.showToast(`Nasabah ${row.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan'}`) }
  catch (e) { uiStore.showToast(e.message, 'error') }
}
</script>

