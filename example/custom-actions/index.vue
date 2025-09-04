<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import ActionButtons from './ActionButtons.vue'
import LearningCard from './LearningCard.vue'

const cards = ref([
  { text: 'Business Strategy', description: 'Learn the fundamentals of strategic planning', icon: '💼' },
  { text: 'Data Science', description: 'Master statistical analysis and machine learning', icon: '📊' },
  { text: 'UI/UX Design', description: 'Create beautiful and intuitive user experiences', icon: '🎨' },
])
</script>

<template>
  <div class="w-full flex justify-center items-center py-20">
    <div class="max-w-sm w-full">
      <FlashCards :items="cards">
        <template #default="{ item }">
          <LearningCard :item="item" />
        </template>

        <template #actions="{ approve, reject, restore }">
          <ActionButtons
            :approve="approve"
            :reject="reject"
            :restore="restore"
          />
        </template>
      </FlashCards>
    </div>
  </div>
</template>
