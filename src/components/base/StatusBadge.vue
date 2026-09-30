<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusClass]">
    {{ label || statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  label: String,
})

const statusMap = {
  aktif: { class: 'bg-green-50 text-green-900', label: 'Aktif' },
  nonaktif: { class: 'bg-gray-100 text-muted', label: 'Nonaktif' },
  selesai: { class: 'bg-green-50 text-green-900', label: 'Selesai' },
  dibatalkan: { class: 'bg-red-50 text-danger', label: 'Dibatalkan' },
  menunggu: { class: 'bg-yellow-50 text-yellow-800', label: 'Menunggu' },
  setoran: { class: 'bg-blue-50 text-blue-800', label: 'Setoran' },
  penarikan: { class: 'bg-orange-50 text-orange-800', label: 'Penarikan' },
  admin: { class: 'bg-green-50 text-green-900', label: 'Admin' },
  petugas: { class: 'bg-blue-50 text-blue-800', label: 'Petugas' },
}

const statusClass = computed(() => statusMap[props.status]?.class || 'bg-gray-100 text-muted')
const statusLabel = computed(() => statusMap[props.status]?.label || props.status)
</script>
