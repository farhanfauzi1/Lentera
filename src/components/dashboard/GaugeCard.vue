<template>
  <div class="card">
    <h3 class="font-semibold text-text mb-4">Status Nasabah</h3>
    <div class="relative h-36 flex items-center justify-center">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <p class="text-2xl font-bold text-text">{{ pct }}%</p>
        <p class="text-xs text-muted">Aktif</p>
      </div>
    </div>
    <div class="mt-3 flex gap-4 justify-center text-xs">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-green-900 flex-shrink-0" />
        <span class="text-muted">Aktif ({{ aktif }})</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0" />
        <span class="text-muted">Nonaktif ({{ nonaktif }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

const props = defineProps({
  aktif: { type: Number, default: 0 },
  nonaktif: { type: Number, default: 0 },
})

const pct = computed(() => {
  const total = props.aktif + props.nonaktif
  if (!total) return 0
  return Math.round((props.aktif / total) * 100)
})

const chartData = computed(() => ({
  labels: ['Aktif', 'Nonaktif'],
  datasets: [{
    data: [props.aktif || 0, props.nonaktif || 0],
    backgroundColor: ['#0F4D2E', '#E5E7EB'],
    borderWidth: 0,
    cutout: '75%',
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  rotation: -90,
  circumference: 180,
}
</script>
