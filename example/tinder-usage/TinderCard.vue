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
    class="w-full h-[500px] bg-cover bg-center rounded-xl relative overflow-hidden"
    :style="{ backgroundImage: `url(${item.image})` }"
  >
    <div
      class="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-black/80 to-transparent"
    >
      <h2 class="m-0 mb-2 text-2xl font-semibold">
        {{ item.text }}
      </h2>
      <p class="m-0 text-base">
        {{ item.description }}
      </p>
    </div>
  </div>
</template>
