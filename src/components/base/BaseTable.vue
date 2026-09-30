<template>
  <div class="overflow-x-auto rounded-card border border-border">
    <table class="w-full text-sm text-left">
      <thead class="bg-gray-50 border-b border-border">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="['px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider', col.class]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-8 text-center">
            <div class="flex justify-center items-center gap-2 text-muted">
              <Loader2 class="w-5 h-5 animate-spin" />
              <span>Memuat...</span>
            </div>
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length" class="px-4 py-12 text-center">
            <div class="flex flex-col items-center gap-2 text-muted">
              <component :is="emptyIcon || InboxIcon" class="w-10 h-10 opacity-40" />
              <p class="font-medium">{{ emptyText || 'Tidak ada data' }}</p>
            </div>
          </td>
        </tr>
        <tr
          v-else
          v-for="(row, idx) in data"
          :key="row.id || idx"
          class="border-b border-border last:border-0 hover:bg-green-50/40 transition"
        >
          <slot :row="row" :index="idx" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Loader2, Inbox as InboxIcon } from 'lucide-vue-next'

defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyText: String,
  emptyIcon: Object,
})
</script>
