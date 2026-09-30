import { ref, computed } from 'vue'

export function usePagination(items, pageSize = 10) {
  const currentPage = ref(1)
  const perPage = ref(pageSize)

  const totalItems = computed(() => items.value?.length || 0)
  const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return (items.value || []).slice(start, start + perPage.value)
  })

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
  }

  function nextPage() { goToPage(currentPage.value + 1) }
  function prevPage() { goToPage(currentPage.value - 1) }
  function resetPage() { currentPage.value = 1 }

  return { currentPage, perPage, totalItems, totalPages, paginatedItems, goToPage, nextPage, prevPage, resetPage }
}
