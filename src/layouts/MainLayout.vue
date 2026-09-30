<template>
  <div class="min-h-screen bg-bg flex">
    <AppSidebar />
    <div class="flex-1 lg:ml-60 flex flex-col min-h-screen">
      <AppHeader />
      <main class="flex-1 pt-16">
        <div class="p-4 lg:p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppHeader from '../components/layout/AppHeader.vue'
</script>
