<script lang="ts" setup>
interface Emits {
  (e: 'resetItems'): void
}

defineEmits<Emits>()
</script>

<template>
  <div class="text-center py-8">
    <div class="text-6xl mb-4">
      🎉
    </div>
    <h3 class="text-xl font-bold">
      All done!
    </h3>
    <p class="text-base-content/70">
      No more cards to swipe
    </p>
    <button class="btn btn-primary mt-4" @click="$emit('resetItems')">
      🔄 Reset Cards
    </button>
  </div>
</template>
