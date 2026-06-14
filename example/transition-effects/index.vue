<script setup lang="ts">
import type { AnimationContext } from '../../src/utils/animationKeyframes'
import { computed, ref } from 'vue'
import FlashCards from '../../src/FlashCards.vue'
import TransitionCard from './TransitionCard.vue'

type TransitionName = 'fast-rotate' | 'scale-out' | 'flip-3d' | 'elastic-bounce'

const selectedTransition = ref<TransitionName>('fast-rotate')

const cards = [
  { id: 1, title: 'Fast Rotate', description: 'Cards spin rapidly while exiting', color: '#FF6B6B' },
  { id: 2, title: 'Scale to Zero', description: 'Cards shrink to nothing', color: '#4ECDC4' },
  { id: 3, title: '3D Flip', description: 'Cards flip in 3D space', color: '#45B7D1' },
  { id: 4, title: 'Elastic Bounce', description: 'Cards bounce with elastic effect', color: '#FFA726' },
  { id: 5, title: 'Custom Effects', description: 'Combine multiple animations', color: '#AB47BC' },
]

/**
 * Horizontal exit offset, signed by direction. Cards only swipe left/right in
 * this demo, so we build the off-screen X from the action type.
 */
function exitX(type: AnimationContext['type']): number {
  return type === 'left' ? -300 : 300
}

/**
 * Each transition describes ONLY the fly-out (the off-screen end frame), from
 * center. The library starts it from the drag-release point and plays it
 * reversed for restore — we don't write either here.
 */
const transitions: Record<TransitionName, (ctx: AnimationContext) => Keyframe> = {
  'fast-rotate': (ctx) => {
    const deg = ctx.type === 'left' ? -360 : 360
    return { transform: `translateX(${exitX(ctx.type)}px) rotate(${deg}deg)`, opacity: 0 }
  },
  'scale-out': ctx => ({ transform: `translateX(${exitX(ctx.type)}px) scale(0)`, opacity: 0 }),
  'flip-3d': (ctx) => {
    const y = ctx.type === 'left' ? -180 : 180
    return { transform: `translateX(${exitX(ctx.type)}px) rotateY(${y}deg) rotateX(45deg)`, opacity: 0 }
  },
  'elastic-bounce': (ctx) => {
    const deg = ctx.type === 'left' ? -15 : 15
    return { transform: `translateX(${exitX(ctx.type)}px) scale(1.3) rotate(${deg}deg)`, opacity: 0 }
  },
}

// Per-transition timing/easing, applied alongside the keyframes.
const timing: Record<TransitionName, { duration: number, easing: string }> = {
  'fast-rotate': { duration: 400, easing: 'linear' },
  'scale-out': { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
  'flip-3d': { duration: 500, easing: 'ease-in-out' },
  'elastic-bounce': { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
}

const animationKeyframes = computed(() => transitions[selectedTransition.value])
const animationDuration = computed(() => timing[selectedTransition.value].duration)
const animationEasing = computed(() => timing[selectedTransition.value].easing)
</script>

<template>
  <div class="max-w-lg mx-auto p-6 transition-effects-example">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-base-content mb-2">
        Custom Transition Effects
      </h2>
      <p class="text-base-content/70">
        Experiment with different transition styles
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
        :animation-keyframes="animationKeyframes"
        :animation-duration="animationDuration"
        :animation-easing="animationEasing"
        loop
      >
        <template #default="{ item }">
          <TransitionCard :card="item" />
        </template>
      </FlashCards>
    </div>
  </div>
</template>
