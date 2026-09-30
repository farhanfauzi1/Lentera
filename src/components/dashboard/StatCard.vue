<template>
  <div
    :class="[
      'rounded-card p-5 flex flex-col gap-3 relative overflow-hidden',
      dark ? 'bg-green-900 text-white' : 'bg-white border border-border shadow-sm',
    ]"
  >
    <div class="flex items-start justify-between">
      <p :class="['text-xs font-semibold uppercase tracking-wider', dark ? 'text-green-200' : 'text-muted']">
        {{ title }}
      </p>
      <button
        :class="[
          'w-7 h-7 rounded-full border flex items-center justify-center transition flex-shrink-0',
          dark ? 'border-green-700 hover:bg-green-700' : 'border-border hover:bg-green-50',
        ]"
      >
        <ArrowUpRight :size="14" :class="dark ? 'text-white' : 'text-green-900'" />
      </button>
    </div>

    <div>
      <p :class="['text-2xl font-bold leading-none', dark ? 'text-white' : 'text-text']">
        {{ value }}
      </p>
      <p v-if="sub" :class="['text-xs mt-1', dark ? 'text-green-200' : 'text-muted']">
        {{ sub }}
      </p>
    </div>

    <div v-if="change !== undefined" class="flex items-center gap-1">
      <TrendingUp v-if="change >= 0" :size="12" :class="dark ? 'text-green-200' : 'text-green-500'" />
      <TrendingDown v-else :size="12" class="text-danger" />
      <span :class="['text-xs font-medium', change >= 0 ? (dark ? 'text-green-200' : 'text-green-500') : 'text-danger']">
        {{ Math.abs(change) }}%
      </span>
      <span :class="['text-xs', dark ? 'text-green-200/70' : 'text-muted']">vs bulan lalu</span>
    </div>
  </div>
</template>

<script setup>
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  sub: String,
  change: Number,
  dark: { type: Boolean, default: false },
})
</script>
