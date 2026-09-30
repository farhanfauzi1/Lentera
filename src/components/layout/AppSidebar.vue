<template>
  <aside
    :class="[
      'fixed left-0 top-0 h-screen bg-white border-r border-border z-40 flex flex-col transition-transform duration-300',
      'w-60',
      uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 h-16 border-b border-border flex-shrink-0">
      <div class="w-8 h-8 bg-green-900 rounded-xl flex items-center justify-center flex-shrink-0">
        <Recycle class="text-white" :size="18" />
      </div>
      <div>
        <p class="font-bold text-text text-sm leading-tight">Bank Sampah</p>
        <p class="text-xs text-green-700 font-semibold">Lentere</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <div class="mb-4">
        <p class="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2">Menu</p>
        <NavItem to="/" :icon="LayoutDashboard" label="Dashboard" exact />
        <NavItem to="/nasabah" :icon="Users" label="Nasabah" />
        <NavItem to="/jenis-sampah" :icon="Recycle" label="Jenis Sampah" />
      </div>

      <div class="mb-4">
        <p class="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2">Transaksi</p>
        <NavItem to="/setoran/baru" :icon="PackagePlus" label="Setoran" />
        <NavItem to="/penarikan" :icon="Wallet" label="Penarikan" />
        <NavItem to="/transaksi" :icon="ArrowLeftRight" label="Riwayat Transaksi" />
      </div>

      <div class="mb-4">
        <p class="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2">Umum</p>
        <NavItem to="/laporan" :icon="BarChart3" label="Laporan" />
        <NavItem v-if="authStore.isAdmin" to="/pengguna" :icon="UserCog" label="Pengguna" />
        <NavItem to="/pengaturan" :icon="Settings" label="Pengaturan" />
      </div>
    </nav>

    <!-- Promo card + logout -->
    <div class="p-3 flex-shrink-0">
      <div class="bg-green-900 rounded-card p-4 mb-3">
        <p class="text-white font-semibold text-sm mb-1">Bank Sampah Lentere</p>
        <p class="text-green-200 text-xs leading-relaxed">Kelola sampah, raih manfaat bersama.</p>
      </div>
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-red-50 hover:text-danger transition font-medium"
      >
        <LogOut :size="18" />
        Keluar
      </button>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <div
    v-if="uiStore.sidebarOpen"
    class="fixed inset-0 bg-black/40 z-30 lg:hidden"
    @click="uiStore.closeSidebar()"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { useUiStore } from '../../stores/ui.js'
import NavItem from './NavItem.vue'
import {
  LayoutDashboard, Users, Recycle, PackagePlus, Wallet,
  ArrowLeftRight, BarChart3, UserCog, Settings, LogOut
} from 'lucide-vue-next'


const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
