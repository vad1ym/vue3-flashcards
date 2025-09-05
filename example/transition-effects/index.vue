<script setup>
import { ref } from 'vue'
import FlashCards from '../../src/FlashCards.vue'
import TransitionCard from './TransitionCard.vue'

const selectedTransition = ref('fast-rotate')

const cards = [
  { id: 1, title: 'Fast Rotate', description: 'Cards spin rapidly while exiting', color: '#FF6B6B' },
  { id: 2, title: 'Scale to Zero', description: 'Cards shrink to nothing', color: '#4ECDC4' },
  { id: 3, title: '3D Flip', description: 'Cards flip in 3D space', color: '#45B7D1' },
  { id: 4, title: 'Elastic Bounce', description: 'Cards bounce with elastic effect', color: '#FFA726' },
  { id: 5, title: 'Custom Effects', description: 'Combine multiple animations', color: '#AB47BC' },
]
</script>

<template>
  <div class="max-w-lg mx-auto p-6 transition-effects-example">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-base-content mb-2">
        Custom Transition Effects
      </h2>
      <p class="text-base-content/70">
        Experiment with different transition styles using the transitionName prop.
      </p>
    </div>

    <div class="bg-base-200 p-6 rounded-2xl mb-8">
      <div class="grid grid-cols-2 gap-4">
        <label class="label cursor-pointer">
          <input
            v-model="selectedTransition"
            type="radio"
            value="fast-rotate"
            class="radio radio-primary"
          >
          <span class="label-text ml-2">Fast Rotate</span>
        </label>
        <label class="label cursor-pointer">
          <input
            v-model="selectedTransition"
            type="radio"
            value="scale-out"
            class="radio radio-secondary"
          >
          <span class="label-text ml-2">Scale to Zero</span>
        </label>
        <label class="label cursor-pointer">
          <input
            v-model="selectedTransition"
            type="radio"
            value="flip-3d"
            class="radio radio-accent"
          >
          <span class="label-text ml-2">3D Flip</span>
        </label>
        <label class="label cursor-pointer">
          <input
            v-model="selectedTransition"
            type="radio"
            value="elastic-bounce"
            class="radio radio-info"
          >
          <span class="label-text ml-2">Elastic Bounce</span>
        </label>
      </div>
    </div>

    <div class="h-96 w-full relative">
      <FlashCards
        :items="cards"
        :transition-name="selectedTransition"
        infinite
      >
        <template #default="{ item }">
          <TransitionCard :card="item" />
        </template>
      </FlashCards>
    </div>
  </div>
</template>

<style>
/* Fast Rotate Transition */
.fast-rotate-enter-active,
.fast-rotate-leave-active {
  transition: all 0.4s linear;
  transform-origin: 50% 50%;
}

.fast-rotate-enter-from,
.fast-rotate-leave-to {
  opacity: 0;
}

.fast-rotate-enter-from.fast-rotate--rejected,
.fast-rotate-leave-to.fast-rotate--rejected {
  transform: translateX(-300px) rotate(-360deg);
}

.fast-rotate-enter-from.fast-rotate--approved,
.fast-rotate-leave-to.fast-rotate--approved {
  transform: translateX(300px) rotate(360deg);
}

/* Scale Out Transition */
.scale-out-enter-active,
.scale-out-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.scale-out-enter-from,
.scale-out-leave-to {
  opacity: 0;
}

.scale-out-enter-from.scale-out--rejected,
.scale-out-leave-to.scale-out--rejected {
  transform: translateX(-300px) scale(0);
}

.scale-out-enter-from.scale-out--approved,
.scale-out-leave-to.scale-out--approved {
  transform: translateX(300px) scale(0);
}

/* 3D Flip Transition */
.flip-3d-enter-active,
.flip-3d-leave-active {
  transition: all 0.5s ease-in-out;
  transform-style: preserve-3d;
}

.flip-3d-enter-from,
.flip-3d-leave-to {
  opacity: 0;
}

.flip-3d-enter-from.flip-3d--rejected,
.flip-3d-leave-to.flip-3d--rejected {
  transform: translateX(-300px) rotateY(-180deg) rotateX(45deg);
}

.flip-3d-enter-from.flip-3d--approved,
.flip-3d-leave-to.flip-3d--approved {
  transform: translateX(300px) rotateY(180deg) rotateX(45deg);
}

/* Elastic Bounce Transition */
.elastic-bounce-enter-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.elastic-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.elastic-bounce-enter-from,
.elastic-bounce-leave-to {
  opacity: 0;
}

.elastic-bounce-enter-from.elastic-bounce--rejected,
.elastic-bounce-leave-to.elastic-bounce--rejected {
  transform: translateX(-300px) scale(1.3) rotate(-15deg);
}

.elastic-bounce-enter-from.elastic-bounce--approved,
.elastic-bounce-leave-to.elastic-bounce--approved {
  transform: translateX(300px) scale(1.3) rotate(15deg);
}
</style>
