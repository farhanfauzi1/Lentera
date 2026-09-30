<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-text">Grafik Setoran</h3>
      <div class="flex gap-1">
        <button
          v-for="p in periods"
          :key="p.value"
          @click="activePeriod = p.value"
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium transition',
            activePeriod === p.value ? 'bg-green-900 text-white' : 'text-muted hover:bg-green-50',
          ]"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
    <div class="h-52">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { transaksiService } from '../../services/mock/transaksi.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const periods = [
  { value: '7hari', label: '7H' },
  { value: '30hari', label: '30H' },
  { value: '12bulan', label: '12B' },
]
const activePeriod = ref('7hari')
const rawData = ref(transaksiService.getChartData('7hari'))

watch(activePeriod, (val) => {
  rawData.value = transaksiService.getChartData(val)
})

const chartData = computed(() => ({
  labels: rawData.value.labels,
  datasets: [{
    data: rawData.value.data,
    backgroundColor: rawData.value.data.map(v => v > 0 ? '#0F4D2E' : '#E5E7EB'),
    borderRadius: 8,
    borderSkipped: false,
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `Rp ${ctx.raw.toLocaleString('id-ID')}` } } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
    y: { grid: { color: '#F3F4F3' }, ticks: { color: '#9CA3AF', font: { size: 11 }, callback: v => `${(v/1000).toFixed(0)}K` } },
  },
}
</script>
