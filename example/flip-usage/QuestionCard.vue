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
  <div class="relative overflow-hidden rounded-2xl shadow-2xl h-72 bg-gradient-to-br from-blue-500 to-purple-600 text-white transform transition-all duration-300">
    <!-- Question mark icon -->
    <div class="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
      <span class="text-white font-bold">?</span>
    </div>

    <!-- Category tag -->
    <div class="absolute top-4 left-4">
      <span class="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
        {{ item.category }}
      </span>
    </div>

    <!-- Question content -->
    <div class="p-6 h-full flex flex-col justify-center items-center text-center">
      <h2 class="text-lg font-bold mb-4 leading-relaxed">
        {{ item.text }}
      </h2>
      <div class="text-sm opacity-80">
        Tap to reveal answer
      </div>
    </div>

    <!-- Difficulty indicator -->
    <div class="absolute bottom-4 left-4">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white rounded-full" />
        <div :class="item.difficulty === 'Easy' ? 'w-2 h-2 bg-green-400 rounded-full' : 'w-2 h-2 bg-white/50 rounded-full'" />
        <div :class="item.difficulty === 'Medium' ? 'w-2 h-2 bg-yellow-400 rounded-full' : 'w-2 h-2 bg-white/50 rounded-full'" />
        <div :class="item.difficulty === 'Hard' ? 'w-2 h-2 bg-red-400 rounded-full' : 'w-2 h-2 bg-white/50 rounded-full'" />
      </div>
    </div>
  </div>
</template>
