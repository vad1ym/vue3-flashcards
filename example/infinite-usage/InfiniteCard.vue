<script setup lang="ts">
interface CardItem {
  text: string
  color: string
}

defineProps<{
  item: CardItem
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-lg w-72 h-72 transform transition-all duration-300 hover:scale-105">
    <div :class="`bg-gradient-to-br ${item.color} h-full relative flex items-center justify-center`">
      <div class="absolute top-2 right-2 text-white/80">
        <div class="text-xs">
          ∞
        </div>
      </div>
      <div class="text-white text-lg font-bold">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>
