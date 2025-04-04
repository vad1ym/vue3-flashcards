<script setup lang="ts">
import { ref } from 'vue'

const { disabled } = defineProps<{
  disabled: boolean
}>()

const isFlipped = ref(false)
const isAnimating = ref(false)

function flip() {
  if (isAnimating.value || disabled)
    return

  isAnimating.value = true
  isFlipped.value = !isFlipped.value
}

function onTransitionEnd() {
  isAnimating.value = false
}
</script>

<template>
  <div class="flip-card" @click="flip">
    <div
      class="flip-card-inner"
      :class="{ 'is-flipped': isFlipped }"
      @transitionend="onTransitionEnd"
    >
      <div class="flip-card-front">
        <slot name="front" />
      </div>
      <div class="flip-card-back">
        <slot name="back" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-card {
  perspective: 1000px;
  width: 100%;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.flip-card-front {
  width: 100%;
  backface-visibility: hidden;
  transform: rotateY(0deg);
}

.flip-card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
}
</style>
