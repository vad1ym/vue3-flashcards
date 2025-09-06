<script setup lang="ts">
interface StackItem {
  id: number
  title: string
  color: string
  icon: string
}

defineProps<{
  item: StackItem
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-lg h-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <!-- Card content -->
    <div class="p-6 flex flex-col justify-center items-center h-full text-center">
      <div :class="`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-md mb-4`">
        <span class="text-3xl">{{ item.icon }}</span>
      </div>

      <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {{ item.title }}
      </h3>

      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Card #{{ item.id }}
      </div>
    </div>
  </div>
</template>
