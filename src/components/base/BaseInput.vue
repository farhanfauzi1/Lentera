<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-text">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="relative">
      <span v-if="$slots.prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        <slot name="prefix" />
      </span>
      <input
        :id="inputId"
        v-bind="$attrs"
        :value="modelValue"
        :class="[
          'w-full px-4 py-2.5 rounded-input border text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition bg-white',
          error ? 'border-danger' : 'border-border',
          $slots.prefix ? 'pl-10' : '',
          $slots.suffix ? 'pr-10' : '',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span v-if="$slots.suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-muted">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { default: '' },
  label: String,
  error: String,
  hint: String,
  required: Boolean,
  id: String,
})
defineEmits(['update:modelValue'])

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2)}`)
</script>
