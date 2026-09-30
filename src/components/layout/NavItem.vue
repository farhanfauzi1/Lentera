<template>
  <router-link
    :to="to"
    custom
    v-slot="{ isActive, isExactActive, navigate }"
  >
    <button
      @click="() => { navigate(); uiStore.closeSidebar() }"
      :class="[
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition relative group',
        (exact ? isExactActive : isActive)
          ? 'text-green-900 bg-green-50 font-semibold'
          : 'text-muted hover:bg-green-50/50 hover:text-green-900',
      ]"
    >
      <span
        v-if="exact ? isExactActive : isActive"
        class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-900 rounded-r-full"
      />
      <component :is="icon" :size="18" :stroke-width="1.5" />
      {{ label }}
    </button>
  </router-link>
</template>

<script setup>
import { useUiStore } from '../../stores/ui.js'

defineProps({
  to: { type: String, required: true },
  icon: { type: Object, required: true },
  label: { type: String, required: true },
  exact: { type: Boolean, default: false },
})

const uiStore = useUiStore()
</script>
