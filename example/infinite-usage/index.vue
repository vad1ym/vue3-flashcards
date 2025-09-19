<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import InfiniteCard from './InfiniteCard.vue'

const cards = ref([
  { id: 1, text: 'A', color: 'from-red-500 to-red-600' },
  { id: 2, text: 'B', color: 'from-green-500 to-green-600' },
  { id: 3, text: 'C', color: 'from-blue-500 to-blue-600' },
])
</script>

<template>
  <div class="w-full flex justify-center items-center py-12">
    <div class="w-80 h-80">
      <FlashCards :items="cards" :loop="true" #="{ item }">
        <InfiniteCard :item="item" />
      </FlashCards>
    </div>
  </div>
</template>
