<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards, FlipCard } from 'vue3-flashcards'
import AnswerCard from './AnswerCard.vue'
import QuestionCard from './QuestionCard.vue'
import '../assets/index.css'

const cards = ref([
  { text: 'What is the capital of France?', back: 'Paris', difficulty: 'Easy', category: 'Geography' },
  { text: 'What is 15 × 8?', back: '120', difficulty: 'Medium', category: 'Mathematics' },
  { text: 'Who wrote "Romeo and Juliet"?', back: 'William Shakespeare', difficulty: 'Easy', category: 'Literature' },
])

const waitAnimationEnd = ref(true)
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center py-20">
    <div class="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="waitAnimationEnd"
          type="checkbox"
          class="toggle toggle-primary"
        >
        <span class="font-medium text-gray-700 dark:text-gray-300">Wait for animation end</span>
      </label>
    </div>

    <div class="max-w-sm w-full">
      <FlashCards :items="cards">
        <template #default="{ item }">
          <FlipCard :wait-animation-end="waitAnimationEnd">
            <template #front>
              <QuestionCard :item="item" />
            </template>
            <template #back>
              <AnswerCard :item="item" />
            </template>
          </FlipCard>
        </template>
      </FlashCards>
    </div>
  </div>
</template>
