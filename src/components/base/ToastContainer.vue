<template>
  <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
    <transition-group name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[260px] max-w-sm',
          toast.type === 'success' ? 'bg-green-900 text-white' : '',
          toast.type === 'error' ? 'bg-danger text-white' : '',
          toast.type === 'warning' ? 'bg-warning text-white' : '',
          toast.type === 'info' ? 'bg-blue-600 text-white' : '',
        ]"
      >
        <CheckCircle v-if="toast.type === 'success'" :size="18" />
        <XCircle v-else-if="toast.type === 'error'" :size="18" />
        <AlertTriangle v-else-if="toast.type === 'warning'" :size="18" />
        <Info v-else :size="18" />
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="uiStore.removeToast(toast.id)" class="opacity-70 hover:opacity-100">
          <X :size="16" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui.js'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const uiStore = useUiStore()
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
