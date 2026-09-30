<template>
  <div class="card text-center py-16 max-w-lg mx-auto mt-12">
    <div class="w-16 h-16 bg-red-50 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
      <ShieldAlert :size="32" />
    </div>
    <h2 class="text-xl font-bold text-text mb-1">Akses Tidak Diizinkan</h2>
    <p class="text-sm text-muted mb-6">
      Anda tidak memiliki hak akses untuk membuka halaman ini. Silakan hubungi Administrator jika memerlukan akses.
    </p>
    <div class="flex justify-center">
      <router-link to="/">
        <BaseButton>Kembali ke Dashboard</BaseButton>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ShieldAlert } from 'lucide-vue-next'
import BaseButton from '../components/base/BaseButton.vue'
</script>
