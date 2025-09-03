<script setup lang="ts">
interface TinderItem {
  id: number
  text: string
  description: string
  image: string
}

defineProps<{
  item: TinderItem
}>()
</script>

<template>
  <div class="tinder-card" :style="{ backgroundImage: `url(${item.image})` }">
    <div class="card-content">
      <h2>{{ item.text }}</h2>
      <p>{{ item.description }}</p>
    </div>
  </div>
</template>

<style scoped>
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
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
</style>
