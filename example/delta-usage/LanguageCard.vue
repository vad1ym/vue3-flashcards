<script setup lang="ts">
interface WordCard {
  word: string
  translation: string
}

defineProps<{
  item: WordCard
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-xl h-48 bg-gradient-to-br from-indigo-500 to-purple-600 text-white transform transition-all duration-300">
    <!-- Language indicator -->
    <div class="absolute top-4 left-4 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
      EN → FR
    </div>

    <!-- Book icon -->
    <div class="absolute top-4 right-4 text-white/80">
      📚
    </div>

    <!-- Content -->
    <div class="p-6 h-full flex flex-col justify-center items-center gap-3 text-center">
      <div class="text-3xl font-bold mb-2">
        {{ item.word }}
      </div>
      <div class="text-xl text-indigo-100">
        {{ item.translation }}
      </div>
    </div>

    <!-- Swipe indicators -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      <div class="w-2 h-2 bg-white/40 rounded-full" />
      <div class="w-2 h-2 bg-white/60 rounded-full" />
      <div class="w-2 h-2 bg-white rounded-full" />
    </div>
  </div>
</template>
