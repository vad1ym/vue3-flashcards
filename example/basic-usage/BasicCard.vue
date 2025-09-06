<script setup lang="ts">
interface CardItem {
  text: string
  subtitle: string
  color: string
}

defineProps<{
  item: CardItem
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-2xl h-64 bg-white dark:bg-gray-800">
    <!-- Gradient header -->
    <div :class="`bg-gradient-to-r ${item.color} h-20 relative`">
      <div class="absolute inset-0 bg-black/10" />
      <div class="absolute bottom-3 left-6 text-white">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <div class="w-4 h-4 bg-white rounded-full" />
        </div>
      </div>
    </div>

    <!-- Card content -->
    <div class="p-6 flex flex-col justify-center items-start h-44">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {{ item.text }}
      </h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {{ item.subtitle }}
      </p>

      <!-- Card footer -->
      <div class="absolute bottom-4 right-6 flex space-x-2">
        <div class="w-2 h-2 bg-gray-300 rounded-full" />
        <div class="w-2 h-2 bg-gray-300 rounded-full" />
        <div class="w-2 h-2 bg-blue-500 rounded-full" />
      </div>
    </div>
  </div>
</template>
