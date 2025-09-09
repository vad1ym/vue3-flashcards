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
</script>

<template>
  <div class="max-w-[400px] mx-auto p-5">
    <div class="relative mb-5">
      <FlashCards :items="items">
        <template #default="{ item }">
          <TinderCard :item="item" />
        </template>

        <template #empty>
          <div class="text-center text-xl text-gray-600 p-10">
            No more cards!
          </div>
        </template>

        <template #actions="{ approve, reject, restore, isEnd, canRestore }">
          <TinderActions
            :approve="approve"
            :reject="reject"
            :restore="restore"
            :is-end="isEnd"
            :can-restore="canRestore"
          />
        </template>
      </FlashCards>
    </div>
  </div>
</template>
