import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let id = 0

  function show(message, type = 'info', duration = 3500) {
    const item = { id: ++id, message, type }
    toasts.value.push(item)
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== item.id)
    }, duration)
  }

  return { toasts, show }
})
