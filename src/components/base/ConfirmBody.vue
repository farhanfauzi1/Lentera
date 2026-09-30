<template>
  <div class="flex items-center gap-3 p-4 py-3 text-sm">
    <div class="flex-shrink-0">
      <AlertTriangle v-if="type === 'warning'" class="text-warning" :size="18" />
      <Trash2 v-else class="text-danger" :size="18" />
    </div>
    <p class="flex-1">{{ message }}</p>
  </div>
</template>

<script setup>
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
defineProps({ message: String, type: { type: String, default: 'danger' } })
</script>
