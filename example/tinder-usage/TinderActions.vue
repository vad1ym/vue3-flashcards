<script setup lang="ts">
defineProps<{
  approve: () => void
  reject: () => void
  restore: () => void
  isEnd: boolean
  canRestore: boolean
}>()
</script>

<template>
  <div class="flex justify-center gap-5 mt-5">
    <button
      class="w-15 h-15 rounded-full text-2xl text-white bg-blue-500 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
      :disabled="!canRestore"
      @click="restore"
    >
      ↺
    </button>

    <button
      class="w-15 h-15 rounded-full text-2xl text-white bg-red-500 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
      :disabled="isEnd"
      @click="reject"
    >
      ✕
    </button>

    <button
      class="w-15 h-15 rounded-full text-2xl text-white bg-green-500 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
      :disabled="isEnd"
      @click="approve"
    >
      ♥
    </button>
  </div>
</template>
