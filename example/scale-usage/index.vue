<script setup lang="ts">
import type { DragPosition } from 'vue3-flashcards'
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import ScaleCard from './ScaleCard.vue'

const cards = ref([
  { id: 1, title: 'Scale Transform', description: 'This card scales instead of rotating when swiped' },
  { id: 2, title: 'Custom Animation', description: 'Demonstrates transformStyle prop override' },
  { id: 3, title: 'No Rotation', description: 'Only scaling and translation applied' },
])

// Custom transform function that scales the card instead of rotating
function scaleTransform({ delta }: DragPosition) {
  const scale = 1 - (Math.abs(delta) * 0.2)
  return `transform: scale(${scale})`
}
</script>

<template>
  <div class="w-full flex justify-center items-center py-20">
    <div class="max-w-sm w-full">
      <FlashCards
        :items="cards"
        :transform-style="scaleTransform"
      >
        <template #default="{ item }">
          <ScaleCard :card="item" />
        </template>
      </FlashCards>
    </div>
  </div>
</template>
