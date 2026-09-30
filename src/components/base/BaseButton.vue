<template>
  <button
    :class="[
      'inline-flex items-center gap-2 font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClass,
      sizeClass,
      { 'rounded-pill': pill, 'rounded-lg': !pill },
      { 'opacity-50 cursor-not-allowed': disabled || loading },
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <component v-if="loading" :is="Loader2Icon" class="w-4 h-4 animate-spin" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Loader2 as Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary, outline, danger, ghost, secondary
  size: { type: String, default: 'md' }, // sm, md, lg
  pill: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const variantClass = computed(() => ({
  primary: 'bg-green-900 text-white hover:bg-green-700 focus:ring-green-900',
  outline: 'border-2 border-green-900 text-green-900 hover:bg-green-50 focus:ring-green-900',
  danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger',
  ghost: 'text-muted hover:bg-green-50 hover:text-green-900 focus:ring-green-900',
  secondary: 'bg-gray-100 text-text hover:bg-gray-200 focus:ring-gray-400',
}[props.variant]))

const sizeClass = computed(() => ({
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5',
  lg: 'px-6 py-3 text-base',
}[props.size]))
</script>
