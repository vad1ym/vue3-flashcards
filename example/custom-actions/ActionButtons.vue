<script setup lang="ts">
defineProps<{
  approve: () => void
  reject: () => void
  restore: () => void
  reset: (options?: { animate?: boolean }) => void
  isStart: boolean
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
      class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
      :disabled="isStart"
      @click="restore"
    >
      ↩️ Restore Last
    </button>
    <button
      class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
      @click="reset()"
    >
      🔄 Reset All
    </button>
    <button
      class="px-6 col-span-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
      @click="reset({ animate: true })"
    >
      🔄 Reset All Animated
    </button>
  </div>
</template>
