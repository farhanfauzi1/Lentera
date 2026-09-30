<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-text">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </label>
    <select
      :id="selectId"
      v-bind="$attrs"
      :value="modelValue"
      :class="[
        'w-full px-4 py-2.5 rounded-input border text-text text-sm focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition bg-white appearance-none',
        error ? 'border-danger' : 'border-border',
      ]"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <slot />
    </select>
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { default: '' },
  label: String,
  placeholder: String,
  error: String,
  required: Boolean,
  id: String,
})
defineEmits(['update:modelValue'])

const selectId = computed(() => props.id || `select-${Math.random().toString(36).slice(2)}`)
</script>
