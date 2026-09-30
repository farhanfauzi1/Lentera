/**
 * Storage helper - thin wrapper around localStorage
 */
const PREFIX = 'lentera_'

export function getStore(key) {
  try {
    const data = localStorage.getItem(PREFIX + key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setStore(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage error:', e)
  }
}

export function removeStore(key) {
  localStorage.removeItem(PREFIX + key)
}

export function clearAllStore() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k))
}
