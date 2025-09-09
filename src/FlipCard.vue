<script setup lang="ts">
import { inject, ref } from 'vue'
import { config } from './config'
import { IsDraggingStateInjectionKey } from './utils/useDragSetup'

const {
  disabled = false,
  waitAnimationEnd = config.defaultFlipWaitAnimationEnd,
  flipAxis = config.defaultFlipAxis,
} = defineProps<{
  // Disable card flipping functionality
  disabled?: boolean

  // Wait for animation to end before can flip card again
  waitAnimationEnd?: boolean

  // Flip axis
  flipAxis?: 'x' | 'y'
}>()

const emit = defineEmits<{
  flip: [isFlipped: boolean]
}>()

defineSlots<{
  front: (props: { flip: () => void }) => any
  back?: (props: { flip: () => void }) => any
}>()

/**
 * Flash cards dragging state
 */
const isDragging = inject(IsDraggingStateInjectionKey, ref(false))
const isFlipped = ref(false)
const isAnimating = ref(false)

function flip() {
  if (disabled || isDragging.value || (waitAnimationEnd && isAnimating.value))
    return

  isAnimating.value = true
  isFlipped.value = !isFlipped.value
  emit('flip', isFlipped.value)
}

function onTransitionEnd() {
  isAnimating.value = false
}

defineExpose({
  flip,
})
</script>

<template>
  <div class="flip-card" @pointerup="flip">
    <div
      class="flip-card__inner"
      :class="[`flip-card__inner--${flipAxis}`, {
        'flip-card__inner--flipped': isFlipped,
      }]"
      @transitionend="onTransitionEnd"
    >
      <div class="flip-card__front">
        <slot name="front" :flip="flip" />
      </div>
      <div class="flip-card__back">
        <slot name="back" :flip="flip" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-card {
  perspective: 1000px;
  width: 100%;
  cursor: pointer;
}

.flip-card__inner {
  position: relative;
  width: 100%;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flip-card__inner--x.flip-card__inner--flipped {
  transform: rotateX(180deg);
}
.flip-card__inner--y.flip-card__inner--flipped {
  transform: rotateY(180deg);
}

.flip-card__front,
.flip-card__back {
  width: 100%;
  backface-visibility: hidden;
}

.flip-card__front {
  transform: rotateY(0deg);
}

.flip-card__back {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
}

.flip-card__inner--y .flip-card__back {
  transform: rotateY(180deg);
}

.flip-card__inner--x .flip-card__back {
  transform: rotateX(180deg);
}
</style>
