import { ref, onUnmounted } from 'vue'

export function useDebounce(fn, delay = 300) {
  let timer = null
  const cancel = () => { if (timer) clearTimeout(timer) }
  const debouncedFn = (...args) => {
    cancel()
    timer = setTimeout(() => fn(...args), delay)
  }
  onUnmounted(cancel)
  return { debouncedFn, cancel }
}
