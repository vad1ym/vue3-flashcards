<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import BasicCard from './BasicCard.vue'
import '../assets/index.css'

const cards = ref([
  { text: 'Mathematics', subtitle: 'Basic algebra and geometry', color: 'from-blue-500 to-blue-600' },
  { text: 'Science', subtitle: 'Physics and chemistry fundamentals', color: 'from-green-500 to-green-600' },
  { text: 'Literature', subtitle: 'Classic novels and poetry', color: 'from-purple-500 to-purple-600' },
])
</script>

<template>
  <div class="w-full flex justify-center items-center py-20">
    <div class="max-w-sm w-full">
      <FlashCards :items="cards" #="{ item }">
        <BasicCard :item="item" />
      </FlashCards>
    </div>
  </div>
</template>
