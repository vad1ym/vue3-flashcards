<script setup lang="ts">
import { ref } from 'vue'
import { FlashCards } from '../src'


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
  <div class="tinder-container">
    <div class="tinder-cards">
      <FlashCards
        :items="items"
      >
        <template #default="{ item }">
          <div class="tinder-card" :style="{ backgroundImage: `url(${item.image})` }">
            <div class="card-content">
              <h2>{{ item.text }}</h2>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </template>

        <template #empty>
          <div class="tinder-empty">
            No more cards!
          </div>
        </template>

        <template #actions="{ approve, reject, restore, isEnd, canRestore }">
          <div class="tinder-buttons">
            <button class="return-button" :disabled="!canRestore" @click="restore">
              ↺
            </button>
            <button class="dislike-button" :disabled="isEnd" @click="reject">
              ✕
            </button>
            <button class="like-button" :disabled="isEnd" @click="approve">
              ♥
            </button>
          </div>
        </template>
      </FlashCards>
    </div>
  </div>
</template>

<style scoped>
.tinder-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.tinder-cards {
  position: relative;
  margin-bottom: 20px;
}

.tinder-card {
  width: 100%;
  height: 500px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}

.card-content h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.card-content p {
  margin: 0;
  font-size: 16px;
}

.tinder-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.tinder-buttons button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.tinder-buttons button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.tinder-buttons button:not(:disabled):hover {
  transform: scale(1.1);
}

.like-button {
  background-color: #4CAF50;
  color: white;
}

.dislike-button {
  background-color: #f44336;
  color: white;
}

.return-button {
  background-color: #2196F3;
  color: white;
}

.no-more-cards {
  text-align: center;
  font-size: 20px;
  color: #666;
  padding: 40px;
}

.swipe-left {
  animation: swipeLeft 0.3s ease-out forwards;
}

.swipe-right {
  animation: swipeRight 0.3s ease-out forwards;
}

@keyframes swipeLeft {
  to {
    transform: translateX(-200%) rotate(-20deg);
    opacity: 0;
  }
}

@keyframes swipeRight {
  to {
    transform: translateX(200%) rotate(20deg);
    opacity: 0;
  }
}
</style>
