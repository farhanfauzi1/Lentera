<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="handleBackdropClick">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleBackdropClick" />
        <div
          :class="['relative bg-white rounded-card shadow-xl w-full overflow-hidden', sizeClass]"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-text">{{ title }}</h2>
            <button @click="$emit('update:modelValue', false)" class="p-1 rounded-full hover:bg-gray-100 text-muted transition" aria-label="Tutup">
              <X :size="18" />
            </button>
          </div>
          <div class="px-6 py-5 overflow-y-auto max-h-[70vh]">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-border bg-gray-50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm, md, lg, xl
  closeOnBackdrop: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}[props.size]))

function handleBackdropClick() {
  if (props.closeOnBackdrop) emit('update:modelValue', false)
}

function handleKeydown(e) {
  if (e.key === 'Escape' && props.modelValue) emit('update:modelValue', false)
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
