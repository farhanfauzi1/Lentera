<template>
  <div class="min-h-screen bg-bg flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Recycle class="text-white" :size="28" />
        </div>
        <h1 class="text-2xl font-bold text-text">Bank Sampah Lentere</h1>
        <p class="text-muted text-sm mt-1">Masuk ke akun Anda</p>
      </div>

      <!-- Form -->
      <div class="card">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <BaseInput
            v-model="form.username"
            label="Username"
            placeholder="Masukkan username"
            required
            :error="errors.username"
            autocomplete="username"
          />

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-text">Password <span class="text-danger">*</span></label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="input-field pr-10"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition"
              >
                <Eye v-if="!showPassword" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-danger">{{ errors.password }}</p>
          </div>

          <p v-if="authError" class="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle :size="16" />
            {{ authError }}
          </p>

          <BaseButton type="submit" :loading="loading" class="w-full justify-center mt-2">
            Masuk
          </BaseButton>
        </form>

        <div class="mt-4 pt-4 border-t border-border">
          <p class="text-xs text-muted text-center">Demo: <strong>admin</strong> / <strong>admin123</strong> atau <strong>petugas</strong> / <strong>petugas123</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Recycle, Eye, EyeOff, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const authError = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  errors.username = form.username ? '' : 'Username wajib diisi'
  errors.password = form.password ? '' : 'Password wajib diisi'
  if (errors.username || errors.password) return

  loading.value = true
  authError.value = ''
  try {
    await authStore.login(form.username, form.password)
    router.push('/')
  } catch (e) {
    authError.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
