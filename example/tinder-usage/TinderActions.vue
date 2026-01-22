<script setup lang="ts">
defineProps<{
  // Directional methods (optional for backward compatibility)
  top?: () => void
  left?: () => void
  right?: () => void
  bottom?: () => void

  // Other methods
  restore: () => void
  skip?: () => void
  reset?: (options?: any) => void

  // State
  isEnd: boolean
  isStart: boolean
  canRestore: boolean
}>()
</script>

<template>
  <div class="flex justify-center gap-3 mt-5">
    <button
      class="w-14 h-14 rounded-full text-xl text-white bg-blue-500 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
      :disabled="!canRestore || isStart"
      @click="restore"
    >
      ↺
    </button>

    <button
      class="w-14 h-14 rounded-full text-xl text-white bg-red-500 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
      :disabled="isEnd"
      @click="left"
    >
      ✕
    </button>

    <!-- Super Like Button -->
    <button
      class="w-14 h-14 rounded-full text-xl text-white bg-gradient-to-br from-blue-400 to-purple-600 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
      :disabled="isEnd"
      @click="top"
    >
      ⭐
    </button>

    <button
      class="w-14 h-14 rounded-full text-xl text-white bg-green-500 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
      :disabled="isEnd"
      @click="right"
    >
      ♥
    </button>
  </div>

  <div class="text-center text-sm text-gray-600 mt-3">
    <div class="flex justify-center gap-4 text-xs">
      <span>↺ Restore</span>
      <span>✕ Nope</span>
      <span>⭐ Super Like</span>
      <span>♥ Like</span>
    </div>
    <div class="mt-2 text-xs text-gray-500">
      💡 Swipe: Left = Nope, Right = Like, Up = Super Like
    </div>
  </div>
</template>
