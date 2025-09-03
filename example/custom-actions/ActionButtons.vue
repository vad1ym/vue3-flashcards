<script setup lang="ts">
defineProps<{
  approve: () => void
  reject: () => void
  restore: () => void
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-4 mt-6">
    <button
      class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
      @click="reject"
    >
      ❌ Skip
    </button>
    <button
      class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
      @click="approve"
    >
      ✅ Learn
    </button>
    <button
      class="col-span-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
      @click="restore"
    >
      ↩️ Restore Last
    </button>
  </div>
</template>
