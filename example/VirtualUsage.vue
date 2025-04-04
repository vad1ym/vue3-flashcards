<script setup lang="ts">
import { ref } from 'vue'
import { FlashCards } from '../src'

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
  <div class="example-container">
    <div class="cards-container">
      <FlashCards
        :items="cards"
        :virtual-buffer="1"
        #="{ item }"
        @approve="onApprove"
        @reject="onReject"
      >
        <div class="p-5 bg-base-200 border select-none border-base-300 shadow-lg rounded-lg h-40 flex flex-col gap-10 justify-center items-center">
          <div class="card-text">
            {{ item.text }}
          </div>
          <div class="card-stats">
            <div>Approved: {{ approved.length }}</div>
            <div>Rejected: {{ rejected.length }}</div>
            <div>Remaining: {{ cards.length - approved.length - rejected.length }}</div>
          </div>
        </div>
      </FlashCards>
    </div>
  </div>
</template>

<style scoped>
.example-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.cards-container {
  max-width: 400px;
  width: 100%;
}

.card-content {
  padding: 20px;
  background-color: white;
  color: black;
  user-select: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-text {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
}
</style>
