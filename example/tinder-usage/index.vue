<script setup lang="ts">
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import TinderActions from './TinderActions.vue'
import TinderCard from './TinderCard.vue'

interface Card {
  id: number
  text: string
  description: string
  image: string
}

const items = ref<Card[]>([
  {
    id: 1,
    text: 'Mountain Adventure',
    description: 'Explore the peaks and valleys',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  },
  {
    id: 2,
    text: 'Beach Paradise',
    description: 'Relax by the ocean',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  },
  {
    id: 3,
    text: 'City Life',
    description: 'Urban exploration',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  },
  {
    id: 4,
    text: 'Forest Retreat',
    description: 'Connect with nature',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
  },
])

function handleSwipe(item: Card, direction: 'left' | 'right' | 'top') {
  if (direction === 'top') {
    // Super like handling
  }
}
</script>

<template>
  <div class="max-w-[400px] mx-auto p-5">
    <div class="mb-5">
      <FlashCards
        :items="items"
        :swipe-direction="['left', 'right', 'top']"
        @swipe-left="(item) => handleSwipe(item, 'left')"
        @swipe-right="(item) => handleSwipe(item, 'right')"
        @swipe-top="(item) => handleSwipe(item, 'top')"
      >
        <template #default="{ item }">
          <TinderCard :item="item" />
        </template>

        <template #left="{ delta }">
          <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" :style="{ backgroundColor: `rgba(0, 0, 0, ${Math.min(Math.abs(delta), 0.5)})` }">
            <div :style="{ opacity: Math.abs(delta) }" class="border-4 border-red-500 text-red-500 px-6 py-3 rounded-lg text-5xl font-black uppercase tracking-wider shadow-lg rotate-[-12deg]">
              NOPE
            </div>
          </div>
        </template>

        <template #right="{ delta }">
          <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" :style="{ backgroundColor: `rgba(0, 0, 0, ${Math.min(Math.abs(delta), 0.5)})` }">
            <div :style="{ opacity: Math.abs(delta) }" class="border-4 border-green-500 text-green-500 px-6 py-3 rounded-lg text-5xl font-black uppercase tracking-wider shadow-lg rotate-[12deg]">
              LIKE
            </div>
          </div>
        </template>

        <template #top="{ delta }">
          <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" :style="{ backgroundColor: `rgba(0, 0, 0, ${Math.min(Math.abs(delta), 0.5)})` }">
            <div :style="{ opacity: Math.abs(delta) }" class="border-4 border-blue-400 text-blue-400 px-4 py-2 rounded-lg text-3xl font-black uppercase tracking-wider shadow-lg">
              🌟 SUPER LIKE
            </div>
          </div>
        </template>

        <template #empty>
          <div class="text-center text-xl text-gray-600 p-10">
            🎉 No more cards! 🎉
          </div>
        </template>

        <template #actions="{ restore, swipeTop, swipeLeft, swipeRight, swipeBottom, isEnd, isStart, canRestore }">
          <TinderActions
            :top="swipeTop"
            :left="swipeLeft"
            :right="swipeRight"
            :bottom="swipeBottom"
            :restore="restore"
            :is-end="isEnd"
            :is-start="isStart"
            :can-restore="canRestore"
          />
        </template>
      </FlashCards>
    </div>
  </div>
</template>
