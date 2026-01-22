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
  <div
    class="w-full h-[500px] bg-cover bg-center rounded-xl relative overflow-hidden shadow-2xl border border-white/10 z-10"
    :style="{ backgroundImage: `url(${item.image})` }"
  >
    <div
      class="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent"
    >
      <h2 class="m-0 mb-2 text-2xl font-bold drop-shadow-lg">
        {{ item.text }}
      </h2>
      <p class="m-0 text-base drop-shadow-md">
        {{ item.description }}
      </p>
    </div>

    <!-- Subtle border gradient -->
    <div class="absolute inset-0 rounded-xl border border-white/20 pointer-events-none" />
  </div>
</template>
