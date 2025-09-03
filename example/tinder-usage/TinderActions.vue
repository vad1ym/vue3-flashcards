<script setup lang="ts">
defineProps<{
  approve: () => void
  reject: () => void
  restore: () => void
  isEnd: boolean
  canRestore: boolean
}>()
</script>

<template>
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

<style scoped>
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
  background-color: #4caf50;
  color: white;
}

.dislike-button {
  background-color: #f44336;
  color: white;
}

.return-button {
  background-color: #2196f3;
  color: white;
}
</style>
