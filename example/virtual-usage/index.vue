<script setup lang="ts">
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import VirtualCard from './VirtualCard.vue'

// Generate 1000 cards for demonstration
const cards = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  text: `Card ${i + 1} of 1000`,
})))

const approved = ref<number[]>([])
const rejected = ref<number[]>([])

function onApprove(card: { id: number }) {
  approved.value.push(card.id)
}

function onReject(card: { id: number }) {
  rejected.value.push(card.id)
}
</script>

<template>
  <div class="w-full flex justify-center items-center min-h-[500px] p-5">
    <div class="max-w-[400px] w-full isolate">
      <FlashCards
        :items="cards"
        :virtual-buffer="2"
        #="{ item }"
        @approve="onApprove"
        @reject="onReject"
      >
        <VirtualCard
          :item="item"
          :approved="approved.length"
          :rejected="rejected.length"
          :remaining="cards.length - approved.length - rejected.length"
          :progress="((approved.length + rejected.length) / cards.length) * 100"
        />
      </FlashCards>
    </div>
  </div>
</template>
