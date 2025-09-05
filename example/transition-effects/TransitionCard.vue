<script setup>
defineProps({
  card: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="card size-full text-white shadow-xl"
    :style="{ backgroundColor: card.color }"
  >
    <div class="card-body">
      <h2 class="card-title">
        {{ card.title }}
      </h2>
      <p>{{ card.description }}</p>
      <div class="card-actions justify-end">
        <div class="badge badge-outline">
          #{{ card.id }}
        </div>
      </div>
    </div>
  </div>
</template>
