<template>
  <div id="app" class="min-h-screen font-sans antialiased text-text bg-bg selection:bg-green-100 selection:text-green-900">
    <router-view />

    <!-- Toast Notifications -->
    <div
      v-if="uiStore.toasts.length > 0"
      class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full no-print"
    >
      <transition-group name="toast">
        <div
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto p-4 rounded-xl shadow-lg border text-sm font-medium flex items-center justify-between gap-3 transition-all duration-300',
            toast.type === 'error'
              ? 'bg-red-50 text-danger border-red-200'
              : toast.type === 'warning'
              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
              : 'bg-green-900 text-white border-green-800',
          ]"
        >
          <div class="flex items-center gap-2.5">
            <CheckCircle v-if="toast.type === 'success' || !toast.type" :size="18" class="text-green-200 flex-shrink-0" />
            <AlertCircle v-else-if="toast.type === 'error'" :size="18" class="text-danger flex-shrink-0" />
            <AlertTriangle v-else :size="18" class="text-yellow-700 flex-shrink-0" />
            <span>{{ toast.message }}</span>
          </div>
          <button
            @click="uiStore.removeToast(toast.id)"
            class="p-1 rounded-lg opacity-70 hover:opacity-100 transition"
            aria-label="Tutup notifikasi"
          >
            <X :size="15" />
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from './stores/ui.js'
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-vue-next'

const uiStore = useUiStore()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease-out;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>

