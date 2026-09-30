<template>
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-xl font-bold text-text">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-muted mt-0.5">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2 flex-shrink-0 ml-4">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: String,
})
</script>
