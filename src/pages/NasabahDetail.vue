<template>
  <div>
    <PageHeader :title="nasabah?.nama || 'Detail Nasabah'" subtitle="Profil dan riwayat transaksi nasabah">
      <template #actions>
        <BaseButton variant="outline" size="sm" @click="router.back()">Kembali</BaseButton>
        <BaseButton v-if="canEdit" size="sm" @click="openEditModal()"><Pencil :size="16" /> Edit</BaseButton>
      </template>
    </PageHeader>

    <div v-if="loading" class="flex justify-center py-12"><Loader2 class="animate-spin text-green-900" :size="32" /></div>
    <div v-else-if="!nasabah" class="card text-center py-12 text-muted">Nasabah tidak ditemukan.</div>
    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="card flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center text-white text-lg font-bold">{{ nasabah.nama[0] }}</div>
            <div>
              <p class="font-bold text-text">{{ nasabah.nama }}</p>
              <p class="text-xs text-muted font-mono">{{ nasabah.kode }}</p>
            </div>
          </div>
          <StatusBadge :status="nasabah.status" />
          <div class="text-sm text-muted space-y-1">
            <p v-if="nasabah.telepon">📞 {{ nasabah.telepon }}</p>
            <p v-if="nasabah.alamat">📍 {{ nasabah.alamat }}</p>
          </div>
        </div>

        <StatCard dark title="Saldo Saat Ini" :value="formatCurrency(nasabah.saldo)" />
        <div class="grid grid-cols-2 gap-4">
          <StatCard title="Total Setoran" :value="formatCurrency(summaryStats.totalSetoran)" />
          <StatCard title="Total Penarikan" :value="formatCurrency(summaryStats.totalPenarikan)" />
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-text mb-4">Riwayat Transaksi</h3>
        <BaseTable :columns="columns" :data="trxHistory">
          <template #default="{ row }">
            <td class="px-4 py-3 font-mono text-xs text-muted">{{ row.kode }}</td>
            <td class="px-4 py-3"><StatusBadge :status="row.tipe" /></td>
            <td class="px-4 py-3 text-sm font-medium">{{ formatCurrency(row.total) }}</td>
            <td class="px-4 py-3 text-xs text-muted">{{ formatDateTime(row.tanggal) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
            <td class="px-4 py-3">
              <router-link :to="`/transaksi/${row.id}`" class="text-green-900 hover:underline text-xs">Detail</router-link>
            </td>
          </template>
        </BaseTable>
      </div>
    </div>

    <BaseModal v-model="showEditModal" title="Edit Nasabah" size="md">
      <form @submit.prevent="handleSave" class="flex flex-col gap-4">
        <BaseInput v-model="form.nama" label="Nama" required :error="formErrors.nama" />
        <BaseInput v-model="form.telepon" label="Telepon" />
        <BaseInput v-model="form.alamat" label="Alamat" />
        <BaseSelect v-model="form.status" label="Status">
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </BaseSelect>
      </form>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <BaseButton variant="ghost" @click="showEditModal = false">Batal</BaseButton>
          <BaseButton :loading="saving" @click="handleSave">Simpan</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Pencil, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { useFormat } from '../composables/useFormat.js'
import { nasabahService } from '../services/mock/nasabah.js'
import { transaksiService } from '../services/mock/transaksi.js'
import PageHeader from '../components/layout/PageHeader.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import BaseTable from '../components/base/BaseTable.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import StatusBadge from '../components/base/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { formatCurrency, formatDateTime } = useFormat()

const canEdit = computed(() => ['admin', 'petugas'].includes(authStore.user?.role))
const loading = ref(true)
const nasabah = ref(null)
const trxHistory = ref([])

const columns = [
  { key: 'kode', label: 'Kode' },
  { key: 'tipe', label: 'Jenis' },
  { key: 'total', label: 'Nominal' },
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: '' },
]

const summaryStats = computed(() => {
  const selesai = trxHistory.value.filter(t => t.status === 'selesai')
  return {
    totalSetoran: selesai.filter(t => t.tipe === 'setoran').reduce((s, t) => s + t.total, 0),
    totalPenarikan: selesai.filter(t => t.tipe === 'penarikan').reduce((s, t) => s + t.total, 0),
  }
})

function loadData() {
  nasabah.value = nasabahService.getById(route.params.id)
  trxHistory.value = transaksiService.getByNasabahId(route.params.id)
  loading.value = false
}

onMounted(() => {
  loadData()
})

const showEditModal = ref(false)
const saving = ref(false)
const form = reactive({ nama: '', telepon: '', alamat: '', status: 'aktif' })
const formErrors = reactive({ nama: '' })

function openEditModal() {
  Object.assign(form, {
    nama: nasabah.value.nama,
    telepon: nasabah.value.telepon || '',
    alamat: nasabah.value.alamat || '',
    status: nasabah.value.status,
  })
  formErrors.nama = ''
  showEditModal.value = true
}

async function handleSave() {
  formErrors.nama = form.nama ? '' : 'Nama wajib diisi'
  if (formErrors.nama) return
  saving.value = true
  try {
    nasabahService.update(nasabah.value.id, form)
    loadData()
    showEditModal.value = false
    uiStore.showToast('Nasabah berhasil diperbarui')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    saving.value = false
  }
}
</script>

