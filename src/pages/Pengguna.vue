<template>
  <div>
    <PageHeader title="Kelola Pengguna" subtitle="Pengaturan akun petugas dan administrator">
      <template #actions>
        <BaseButton @click="openModal()">
          <Plus :size="16" /> Tambah Pengguna
        </BaseButton>
      </template>
    </PageHeader>

    <div class="card">
      <BaseTable :columns="columns" :data="list" :loading="loading">
        <template #default="{ row }">
          <td class="px-4 py-3 font-medium text-text">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-green-900 flex items-center justify-center text-white text-xs font-bold">
                {{ row.nama[0].toUpperCase() }}
              </div>
              <div>
                <p class="font-medium text-text">{{ row.nama }}</p>
                <p class="text-xs text-muted">{{ row.telepon || '-' }}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 font-mono text-xs text-muted">@{{ row.username }}</td>
          <td class="px-4 py-3">
            <StatusBadge :status="row.role" />
          </td>
          <td class="px-4 py-3">
            <StatusBadge :status="row.status" />
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-1">
              <button
                @click="openModal(row)"
                class="p-1.5 rounded-lg hover:bg-green-50 text-muted hover:text-green-900 transition"
                title="Edit"
              >
                <Pencil :size="15" />
              </button>
              <button
                @click="openResetPassword(row)"
                class="p-1.5 rounded-lg hover:bg-yellow-50 text-muted hover:text-yellow-700 transition"
                title="Reset Password"
              >
                <Key :size="15" />
              </button>
              <button
                v-if="row.id !== authStore.user?.id"
                @click="confirmDelete(row)"
                class="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-danger transition"
                title="Hapus"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </td>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Form -->
    <BaseModal v-model="showModal" :title="editData ? 'Edit Pengguna' : 'Tambah Pengguna'" size="md">
      <form @submit.prevent="handleSave" class="flex flex-col gap-4">
        <BaseInput v-model="form.nama" label="Nama Lengkap" placeholder="Nama" required :error="formErrors.nama" />
        <BaseInput v-model="form.username" label="Username" placeholder="username" required :error="formErrors.username" />
        <BaseInput v-if="!editData" v-model="form.password" label="Password" type="password" placeholder="Minimal 6 karakter" required :error="formErrors.password" />
        <BaseInput v-model="form.telepon" label="Nomor Telepon" placeholder="08xxxxxxxxxx" />
        <BaseSelect v-model="form.role" label="Role / Peran" required>
          <option value="admin">Admin</option>
          <option value="petugas">Petugas</option>
        </BaseSelect>
        <BaseSelect v-model="form.status" label="Status" :disabled="editData?.id === authStore.user?.id">
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

    <!-- Reset Password Modal -->
    <BaseModal v-model="showResetModal" title="Reset Password Pengguna" size="sm">
      <div class="space-y-4">
        <p class="text-xs text-muted">
          Atur password baru untuk akun <strong>{{ resetTarget?.nama }}</strong> (@{{ resetTarget?.username }}):
        </p>
        <BaseInput
          v-model="newPassword"
          label="Password Baru"
          type="password"
          placeholder="Password baru"
          required
        />
      </div>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <BaseButton variant="ghost" @click="showResetModal = false">Batal</BaseButton>
          <BaseButton :loading="saving" :disabled="!newPassword" @click="handleResetPassword">Simpan Password</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Modal -->
    <BaseModal v-model="showDeleteModal" title="Hapus Pengguna" size="sm">
      <p class="text-sm text-text">
        Apakah Anda yakin ingin menghapus akun <strong>{{ deleteTarget?.nama }}</strong>? Tindakan ini tidak dapat dibatalkan.
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
import { ref, reactive, onMounted } from 'vue'
import { Plus, Pencil, Key, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { authService } from '../services/mock/auth.js'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseTable from '../components/base/BaseTable.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import StatusBadge from '../components/base/StatusBadge.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(false)
const list = ref([])
const columns = [
  { key: 'nama', label: 'Nama Pengguna' },
  { key: 'username', label: 'Username' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
]

function loadData() {
  loading.value = true
  list.value = authService.getAll()
  loading.value = false
}

onMounted(loadData)

const showModal = ref(false)
const editData = ref(null)
const saving = ref(false)
const form = reactive({ nama: '', username: '', password: '', telepon: '', role: 'petugas', status: 'aktif' })
const formErrors = reactive({ nama: '', username: '', password: '' })

function openModal(row = null) {
  editData.value = row
  formErrors.nama = ''
  formErrors.username = ''
  formErrors.password = ''
  if (row) {
    Object.assign(form, { nama: row.nama, username: row.username, password: '', telepon: row.telepon || '', role: row.role, status: row.status })
  } else {
    Object.assign(form, { nama: '', username: '', password: '', telepon: '', role: 'petugas', status: 'aktif' })
  }
  showModal.value = true
}

async function handleSave() {
  formErrors.nama = form.nama ? '' : 'Nama wajib diisi'
  formErrors.username = form.username ? '' : 'Username wajib diisi'
  if (!editData.value && !form.password) formErrors.password = 'Password wajib diisi'

  if (formErrors.nama || formErrors.username || formErrors.password) return

  saving.value = true
  try {
    if (editData.value) {
      authService.update(editData.value.id, form)
      uiStore.showToast('Pengguna berhasil diperbarui')
    } else {
      authService.create(form)
      uiStore.showToast('Pengguna berhasil ditambahkan')
    }
    showModal.value = false
    loadData()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    saving.value = false
  }
}

const showResetModal = ref(false)
const resetTarget = ref(null)
const newPassword = ref('')

function openResetPassword(row) {
  resetTarget.value = row
  newPassword.value = ''
  showResetModal.value = true
}

async function handleResetPassword() {
  if (!newPassword.value) return
  saving.value = true
  try {
    authService.resetPassword(resetTarget.value.id, newPassword.value)
    uiStore.showToast(`Password untuk @${resetTarget.value.username} berhasil direset`)
    showResetModal.value = false
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
    authService.delete(deleteTarget.value.id)
    uiStore.showToast('Pengguna berhasil dihapus')
    showDeleteModal.value = false
    loadData()
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    deleting.value = false
  }
}
</script>

