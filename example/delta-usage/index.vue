<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import LanguageCard from './LanguageCard.vue'
import SwipeOverlay from './SwipeOverlay.vue'
import '../assets/index.css'

interface WordCard {
  word: string
  translation: string
}

const cards = ref<WordCard[]>([
  { word: 'Hello', translation: 'Bonjour' },
  { word: 'World', translation: 'Monde' },
  { word: 'Thank you', translation: 'Merci' },
  { word: 'Goodbye', translation: 'Au revoir' },
  { word: 'Please', translation: 'S\'il vous plaît' },
])
</script>

<template>
  <div class="w-full flex justify-center items-center py-20">
    <div class="max-w-sm w-full">
      <FlashCards :items="cards">
        <template #default="{ item }">
          <LanguageCard :item="item" />
        </template>

        <template #approve="{ delta }">
          <SwipeOverlay :delta="delta" type="approve" />
        </template>

        <template #reject="{ delta }">
          <SwipeOverlay :delta="delta" type="reject" />
        </template>
      </FlashCards>
    </div>
  </div>
</template>
