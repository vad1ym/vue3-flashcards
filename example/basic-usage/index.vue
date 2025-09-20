<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import BasicCard from './BasicCard.vue'

const cards = ref([
  { id: 1, text: 'Mathematics', subtitle: 'Basic algebra and geometry', color: 'from-blue-500 to-blue-600' },
  { id: 2, text: 'Science', subtitle: 'Physics and chemistry fundamentals', color: 'from-green-500 to-green-600' },
  { id: 3, text: 'Literature', subtitle: 'Classic novels and poetry', color: 'from-purple-500 to-purple-600' },
])

const verticalSwipe = ref(false)
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center py-20">
    <div class="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="verticalSwipe"
          type="checkbox"
          class="toggle toggle-primary"
        >
        <span class="font-medium text-gray-700 dark:text-gray-300">Vertical swipe</span>
      </label>
    </div>

    <div class="max-w-sm w-full">
      <FlashCards
        :items="cards"
        :swipe-direction="verticalSwipe ? 'vertical' : 'horizontal'"
        #="{ item }"
      >
        <BasicCard :item="item" />
      </FlashCards>
    </div>
  </div>
</template>
