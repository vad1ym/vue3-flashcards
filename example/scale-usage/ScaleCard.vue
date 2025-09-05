<script setup lang="ts">
interface Card {
  id: number
  title: string
  description: string
}

defineProps<{
  card: Card
}>()
</script>

<template>
  <div class="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl h-80 relative overflow-hidden">
    <div class="card-body p-6">
      <div class="flex justify-between items-center mb-4">
        <h4 class="card-title text-2xl font-bold">
          {{ card.title }}
        </h4>
        <div class="badge badge-outline badge-lg">
          #{{ card.id }}
        </div>
      </div>

      <p class="text-primary-content/90 text-lg leading-relaxed flex-1">
        {{ card.description }}
      </p>

      <div class="card-actions justify-center mt-4">
        <span class="text-sm italic opacity-70">
          Swipe left or right
        </span>
      </div>
    </div>
  </div>
</template>
