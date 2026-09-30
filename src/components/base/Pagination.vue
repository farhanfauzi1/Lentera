<template>
  <div class="flex items-center gap-1">
    <button
      v-if="totalPages > 1"
      @click="$emit('prev')"
      :disabled="currentPage <= 1"
      class="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition text-muted"
    >
      <ChevronLeft :size="16" />
    </button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="px-2 text-muted text-sm">…</span>
      <button
        v-else
        @click="$emit('goto', page)"
        :class="[
          'px-3 py-1 rounded-lg text-sm font-medium transition',
          page === currentPage ? 'bg-green-900 text-white' : 'hover:bg-gray-100 text-text',
        ]"
      >
        {{ page }}
      </button>
    </template>

    <button
      v-if="totalPages > 1"
      @click="$emit('next')"
      :disabled="currentPage >= totalPages"
      class="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition text-muted"
    >
      <ChevronRight :size="16" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
defineEmits(['prev', 'next', 'goto'])

const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})
</script>
