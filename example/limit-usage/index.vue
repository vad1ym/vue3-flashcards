<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import LimitCard from './LimitCard.vue'
import '../assets/index.css'

const cards = ref([
  { text: 'Mathematics', subtitle: 'Basic algebra and geometry', color: 'from-blue-500 to-blue-600' },
  { text: 'Science', subtitle: 'Physics and chemistry fundamentals', color: 'from-green-500 to-green-600' },
  { text: 'Literature', subtitle: 'Classic novels and poetry', color: 'from-purple-500 to-purple-600' },
])

const limitY = ref(true)
const limitX = ref(true)
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center py-20 space-y-8">
    <div class="flex space-x-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <label class="flex items-center space-x-2">
        <input v-model="limitY" type="checkbox" class="toggle toggle-primary">
        <span class="text-gray-700 dark:text-gray-300">Limit Y (0px)</span>
      </label>
      <label class="flex items-center space-x-2">
        <input v-model="limitX" type="checkbox" class="toggle toggle-primary">
        <span class="text-gray-700 dark:text-gray-300">Limit X (200px)</span>
      </label>
    </div>

    <div class="max-w-sm w-full">
      <FlashCards
        :items="cards"
        :max-dragging-x="limitX ? 200 : null"
        :max-dragging-y="limitY ? 0 : null"
        #="{ item }"
      >
        <LimitCard :item="item" />
      </FlashCards>
    </div>
  </div>
</template>
