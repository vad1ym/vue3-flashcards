<script setup lang="ts">
interface LearningItem {
  text: string
  description: string
  icon: string
}

defineProps<{
  item: LearningItem
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-xl h-56 bg-white dark:bg-gray-800 transform transition-all duration-300 hover:shadow-2xl border dark:border-gray-700">
    <!-- Icon header -->
    <div class="absolute top-4 right-4 text-3xl">
      {{ item.icon }}
    </div>

    <!-- Content -->
    <div class="p-6 h-full flex flex-col justify-center">
      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
        {{ item.text }}
      </h3>
      <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {{ item.description }}
      </p>
    </div>

    <!-- Subtle decoration -->
    <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
  </div>
</template>
