import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/mock/auth.js'
import { getStore, setStore, removeStore } from '../services/mock/storage.js'

const SESSION_KEY = 'session'
const LAST_ACTIVE_KEY = 'last_active'
const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export const useAuthStore = defineStore('auth', () => {
  const user = ref(getStore(SESSION_KEY) || null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isPetugas = computed(() => user.value?.role === 'petugas')

  function updateLastActive() {
    setStore(LAST_ACTIVE_KEY, Date.now())
  }

  function checkTimeout() {
    const last = getStore(LAST_ACTIVE_KEY)
    if (last && Date.now() - last > TIMEOUT_MS) {
      logout()
      return true
    }
    return false
  }

  async function login(username, password) {
    isLoading.value = true
    error.value = null
    try {
      const result = authService.login(username, password)
      user.value = result
      setStore(SESSION_KEY, result)
      updateLastActive()
      return result
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    removeStore(SESSION_KEY)
    removeStore(LAST_ACTIVE_KEY)
  }

  function refreshSession() {
    const stored = getStore(SESSION_KEY)
    if (stored) {
      user.value = stored
      updateLastActive()
    }
  }

  function updateProfile(data) {
    if (!user.value) return
    const updated = { ...user.value, ...data }
    user.value = updated
    setStore(SESSION_KEY, updated)
    authService.update(user.value.id, data)
  }

  return {
    user, isLoading, error,
    isAuthenticated, isAdmin, isPetugas,
    login, logout, refreshSession, updateProfile, updateLastActive, checkTimeout
  }
})
