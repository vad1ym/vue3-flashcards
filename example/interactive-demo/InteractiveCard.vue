<script lang="ts" setup>
export interface CardItem {
  id: number
  emoji: string
  title: string
  subtitle: string
  color: string
}

defineProps<{
  item: CardItem
}>()
</script>

<template>
  <div
    class="card bg-gradient-to-br shadow-xl border border-base-300 text-white overflow-hidden"
    :class="item.color"
    :style="{ minHeight: '300px' }"
  >
    <div class="card-body items-center justify-center text-center p-8">
      <div class="text-3xl font-bold mb-2">
        {{ item.emoji }}
      </div>
      <h2 class="card-title text-xl mb-2">
        {{ item.title }}
      </h2>
      <p class="text-sm opacity-90">
        {{ item.subtitle }}
      </p>
      <div class="mt-4 text-xs opacity-70">
        ID: {{ item.id }}
      </div>
    </div>
  </div>
</template>
