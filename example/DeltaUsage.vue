<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from '../src'
import './assets/index.css'

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
      <FlashCards
        :items="cards"
      >
        <template #default="{ item }">
          <div
            class="p-5 bg-base-200 border border-base-300 shadow-lg rounded-lg h-40 flex flex-col justify-center items-center gap-2"
          >
            <div class="text-2xl font-bold">
              {{ item.word }}
            </div>
            <div class="text-lg text-gray-600">
              {{ item.translation }}
            </div>
          </div>
        </template>

        <template #approve="{ delta }">
          <div
            class="absolute bg-base-200 inset-0 flex items-center justify-center text-green-500 rounded-lg  font-bold text-xl"
            :style="{ opacity: delta }"
          >
            I know this!
          </div>
        </template>

        <template #reject="{ delta }">
          <div
            class="absolute bg-base-200 inset-0 flex items-center justify-center text-red-500 rounded-lg font-bold text-xl"
            :style="{ opacity: delta }"
          >
            Need to review
          </div>
        </template>
      </FlashCards>
    </div>
  </div>
</template>
