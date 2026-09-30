<template>
  <div>
    <PageHeader title="Pengaturan" subtitle="Konfigurasi akun dan preferensi sistem" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Profile Card -->
        <div class="card">
          <h3 class="font-semibold text-text mb-4">Profil Saya</h3>
          <form @submit.prevent="handleSaveProfile" class="flex flex-col gap-4">
            <BaseInput v-model="profileForm.nama" label="Nama Lengkap" required />
            <BaseInput v-model="profileForm.username" label="Username" disabled hint="Username tidak dapat diubah" />
            <BaseInput v-model="profileForm.telepon" label="Nomor Telepon" placeholder="08xxxxxxxxxx" />
            <div class="flex justify-end pt-2">
              <BaseButton :loading="savingProfile" type="submit">Simpan Profil</BaseButton>
            </div>
          </form>
        </div>

        <!-- Change Password Card -->
        <div class="card">
          <h3 class="font-semibold text-text mb-4">Ganti Password</h3>
          <form @submit.prevent="handleChangePassword" class="flex flex-col gap-4">
            <BaseInput v-model="pwdForm.oldPassword" label="Password Lama" type="password" required :error="pwdErrors.oldPassword" />
            <BaseInput v-model="pwdForm.newPassword" label="Password Baru" type="password" required :error="pwdErrors.newPassword" />
            <BaseInput v-model="pwdForm.confirmPassword" label="Konfirmasi Password Baru" type="password" required :error="pwdErrors.confirmPassword" />
            <div class="flex justify-end pt-2">
              <BaseButton :loading="savingPwd" type="submit">Ubah Password</BaseButton>
            </div>
          </form>
        </div>

        <!-- App Info (Admin Only) -->
        <div v-if="authStore.isAdmin" class="card">
          <h3 class="font-semibold text-text mb-4">Profil Instansi Bank Sampah</h3>
          <form @submit.prevent="handleSaveAppInfo" class="flex flex-col gap-4">
            <BaseInput v-model="appInfo.name" label="Nama Bank Sampah" required />
            <BaseInput v-model="appInfo.address" label="Alamat Kantor / Bank Sampah" />
            <BaseInput v-model="appInfo.contact" label="Kontak / WhatsApp" />
            <div class="flex justify-end pt-2">
              <BaseButton :loading="savingApp" type="submit">Simpan Info Instansi</BaseButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Side Quick Links & Actions -->
      <div class="space-y-6">
        <div class="card bg-green-50/50 border border-green-200">
          <h3 class="font-semibold text-green-900 mb-2">Informasi Akun</h3>
          <p class="text-xs text-muted mb-4">Anda masuk sebagai pengguna aktif sistem.</p>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-muted">Peran:</span><span class="font-bold text-text capitalize">{{ authStore.user?.role }}</span></div>
            <div class="flex justify-between"><span class="text-muted">Status:</span><span class="font-semibold text-green-900">Aktif</span></div>
          </div>
        </div>

        <div v-if="authStore.isAdmin" class="card">
          <h3 class="font-semibold text-text mb-2">Data & Penyimpanan</h3>
          <p class="text-xs text-muted mb-4">Kelola data percontohan (mock localStorage) aplikasi.</p>
          <BaseButton variant="danger" size="sm" class="w-full justify-center" @click="handleResetAll">
            <RotateCcw :size="16" /> Reset Mock Data ke Awal
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { authService } from '../services/mock/auth.js'
import { clearAllStore, getStore, setStore } from '../services/mock/storage.js'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()

const profileForm = reactive({ nama: '', username: '', telepon: '' })
const savingProfile = ref(false)

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdErrors = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const savingPwd = ref(false)

const appInfo = reactive({
  name: 'Bank Sampah Lentere',
  address: 'Jl. Lingkungan Lestari No. 12, Bandung',
  contact: '0812-3456-7890',
})
const savingApp = ref(false)

onMounted(() => {
  if (authStore.user) {
    profileForm.nama = authStore.user.nama
    profileForm.username = authStore.user.username
    profileForm.telepon = authStore.user.telepon || ''
  }
  const savedApp = getStore('app_info')
  if (savedApp) Object.assign(appInfo, savedApp)
})

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    authStore.updateProfile({
      nama: profileForm.nama,
      telepon: profileForm.telepon,
    })
    uiStore.showToast('Profil berhasil diperbarui')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  pwdErrors.oldPassword = pwdForm.oldPassword ? '' : 'Password lama wajib diisi'
  pwdErrors.newPassword = pwdForm.newPassword ? '' : 'Password baru wajib diisi'
  pwdErrors.confirmPassword = pwdForm.newPassword === pwdForm.confirmPassword ? '' : 'Konfirmasi password tidak cocok'

  if (pwdErrors.oldPassword || pwdErrors.newPassword || pwdErrors.confirmPassword) return

  savingPwd.value = true
  try {
    authService.changePassword(authStore.user.id, pwdForm.oldPassword, pwdForm.newPassword)
    uiStore.showToast('Password berhasil diganti')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    savingPwd.value = false
  }
}

async function handleSaveAppInfo() {
  savingApp.value = true
  try {
    setStore('app_info', appInfo)
    uiStore.showToast('Informasi instansi berhasil disimpan')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    savingApp.value = false
  }
}

function handleResetAll() {
  if (confirm('Apakah Anda yakin ingin mengembalikan semua data ke kondisi awal demo?')) {
    clearAllStore()
    window.location.reload()
  }
}
</script>

