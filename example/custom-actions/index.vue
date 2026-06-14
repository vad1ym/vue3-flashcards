<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import ActionButtons from './ActionButtons.vue'
import LearningCard from './LearningCard.vue'

const cards = ref([
  { id: 1, text: 'Business Strategy', description: 'Learn the fundamentals of strategic planning', icon: '💼' },
  { id: 2, text: 'Data Science', description: 'Master statistical analysis and machine learning', icon: '📊' },
  { id: 3, text: 'UI/UX Design', description: 'Create beautiful and intuitive user experiences', icon: '🎨' },
  { id: 4, text: 'Frontend Development', description: 'Build responsive and interactive web applications', icon: '💻' },
  { id: 5, text: 'DevOps', description: 'Gain hands-on experience with DevOps tools and practices', icon: '🚀' },
])

const disableDrag = ref(false)
</script>

<template>
  <div class="w-full flex justify-center items-center py-20">
    <div class="max-w-sm w-full">
      <div class="mb-4 flex items-center justify-center">
        <label class="flex items-center space-x-2">
          <input
            v-model="disableDrag"
            type="checkbox"
            class="toggle toggle-primary"
          >
          <span>Disable Drag</span>
        </label>
      </div>

      <FlashCards :items="cards" :disable-drag="disableDrag">
        <template #default="{ item }">
          <LearningCard :item="item" />
        </template>

        <template #actions="{ swipeRight, swipeLeft, restore, reset, isStart }">
          <ActionButtons
            :swipe-right="swipeRight"
            :swipe-left="swipeLeft"
            :restore="restore"
            :reset="reset"
            :is-start="isStart"
          />
        </template>
      </FlashCards>
    </div>
  </div>
</template>
