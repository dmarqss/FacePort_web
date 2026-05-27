<template>
  <router-view />
  <!-- Global toasts -->
  <div class="fp-toast">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="fp-toast-item"
      :class="t.type"
    >{{ t.message }}</div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'
const { toasts } = storeToRefs(useToastStore())
</script>
