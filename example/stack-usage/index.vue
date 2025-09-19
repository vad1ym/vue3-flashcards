<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import StackCard from './StackCard.vue'

const stackSize = ref(5)
const stackDirection = ref<'top' | 'bottom' | 'left' | 'right'>('bottom')

const cards = ref([
  { id: 1, title: 'Project Alpha', color: 'from-blue-500 to-cyan-500', icon: '🚀' },
  { id: 2, title: 'Design System', color: 'from-purple-500 to-pink-500', icon: '🎨' },
  { id: 3, title: 'Data Analytics', color: 'from-green-500 to-emerald-500', icon: '📊' },
  { id: 4, title: 'Machine Learning', color: 'from-orange-500 to-red-500', icon: '🤖' },
  { id: 5, title: 'Cloud Infrastructure', color: 'from-teal-500 to-blue-500', icon: '☁️' },
  { id: 6, title: 'Security Audit', color: 'from-red-500 to-pink-500', icon: '🔒' },
  { id: 7, title: 'API Integration', color: 'from-indigo-500 to-purple-500', icon: '🔗' },
  { id: 8, title: 'User Experience', color: 'from-yellow-500 to-orange-500', icon: '✨' },
])

const directions = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]
</script>

<template>
  <div class="w-full py-16">
    <!-- Controls -->
    <div class="max-w-sm mx-auto mb-8 px-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
        <div class="space-y-4">
          <!-- Stack Size -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stack Size: {{ stackSize }}
            </label>
            <input
              v-model.number="stackSize"
              type="range"
              min="1"
              max="10"
              step="1"
              class="w-full appearance-none h-2 rounded-lg bg-gray-200 accent-blue-500 cursor-pointer"
            >
          </div>

          <!-- Direction -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Direction
            </label>
            <select
              v-model="stackDirection"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option v-for="direction in directions" :key="direction.value" :value="direction.value">
                {{ direction.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- FlashCards Demo -->
    <div class="flex justify-center items-center min-h-[300px]">
      <div class="max-w-xs w-full px-4">
        <FlashCards
          :items="cards"
          :stack="stackSize"
          :stack-direction="stackDirection"
          :loop="true"
          #="{ item }"
        >
          <StackCard :item="item" />
        </FlashCards>
      </div>
    </div>
  </div>
</template>
