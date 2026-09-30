<template>
  <header class="fixed top-0 left-0 lg:left-60 right-0 h-16 bg-white border-b border-border z-30 flex items-center px-4 lg:px-6 gap-4">
    <!-- Mobile menu button -->
    <button
      @click="uiStore.toggleSidebar()"
      class="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-muted transition"
      aria-label="Buka menu"
    >
      <Menu :size="20" />
    </button>

    <!-- Search -->
    <div class="flex-1 max-w-md">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" :size="16" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari..."
          class="w-full pl-9 pr-16 py-2 rounded-pill border border-border bg-gray-50 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition"
          @keydown.enter="handleSearch"
        />
        <kbd class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted bg-gray-100 border border-border rounded px-1.5 py-0.5 font-mono">
          ↵
        </kbd>
      </div>
    </div>

    <div class="flex-1" />

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <button class="p-2 rounded-xl hover:bg-gray-100 text-muted transition relative" aria-label="Notifikasi">
        <Bell :size="20" />
      </button>
      <button class="p-2 rounded-xl hover:bg-gray-100 text-muted transition" aria-label="Pesan">
        <Mail :size="20" />
      </button>

      <!-- Avatar -->
      <div class="flex items-center gap-2 pl-2 border-l border-border ml-1">
        <div class="w-8 h-8 rounded-full bg-green-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {{ userInitials }}
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-semibold text-text leading-tight">{{ authStore.user?.nama }}</p>
          <p class="text-xs text-muted capitalize">{{ authStore.user?.role }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { useUiStore } from '../../stores/ui.js'
import { Search, Bell, Mail, Menu } from 'lucide-vue-next'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const searchQuery = ref('')

const userInitials = computed(() => {
  const name = authStore.user?.nama || ''
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/transaksi', query: { search: searchQuery.value } })
    searchQuery.value = ''
  }
}
</script>
