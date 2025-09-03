<script setup lang="ts">
interface QuizItem {
  text: string
  back: string
  difficulty: string
  category: string
}

defineProps<{
  item: QuizItem
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-2xl h-72 bg-gradient-to-br from-emerald-500 to-teal-600 text-white transform transition-all duration-300">
    <!-- Answer checkmark icon -->
    <div class="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
      <span class="text-white font-bold">✓</span>
    </div>

    <!-- Category tag -->
    <div class="absolute top-4 left-4">
      <span class="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
        {{ item.category }}
      </span>
    </div>

    <!-- Answer content -->
    <div class="p-6 h-full flex flex-col justify-center items-center text-center">
      <div class="text-sm opacity-80 mb-2">
        Answer:
      </div>
      <h2 class="text-2xl font-bold mb-4">
        {{ item.back }}
      </h2>
      <div class="text-sm opacity-80">
        Swipe to continue
      </div>
    </div>

    <!-- Difficulty indicator -->
    <div class="absolute bottom-4 left-4">
      <span class="px-2 py-1 bg-white/20 rounded-full text-xs">
        {{ item.difficulty }}
      </span>
    </div>
  </div>
</template>
