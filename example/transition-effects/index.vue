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
        :class="selectedTransition"
        loop
      >
        <template #default="{ item }">
          <TransitionCard :card="item" />
        </template>
      </FlashCards>
    </div>
  </div>
</template>

<style>
/* Fast Rotate Animation */
.fast-rotate .flash-card-animation--right { animation: fast-rotate-right 0.4s linear forwards !important; transform-origin: 50% 50% !important; }
.fast-rotate .flash-card-animation--left { animation: fast-rotate-left 0.4s linear forwards !important; transform-origin: 50% 50% !important; }
.fast-rotate .flash-card-animation--right-restore { animation: fast-rotate-restore-right 0.4s linear forwards !important; transform-origin: 50% 50% !important; }
.fast-rotate .flash-card-animation--left-restore { animation: fast-rotate-restore-left 0.4s linear forwards !important; transform-origin: 50% 50% !important; }

@keyframes fast-rotate-right { 0%{opacity:1;} 100%{transform:translateX(300px) rotate(360deg);opacity:0;} }
@keyframes fast-rotate-left { 0%{opacity:1;} 100%{transform:translateX(-300px) rotate(-360deg);opacity:0;} }
@keyframes fast-rotate-restore-right { 0%{transform:translateX(300px) rotate(360deg);opacity:0;} 100%{transform:translateX(0) rotate(0deg);opacity:1;} }
@keyframes fast-rotate-restore-left { 0%{transform:translateX(-300px) rotate(-360deg);opacity:0;} 100%{transform:translateX(0) rotate(0deg);opacity:1;} }

/* Scale Out Animation */
.scale-out .flash-card-animation--right { animation: scale-out-right 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards !important; }
.scale-out .flash-card-animation--left { animation: scale-out-left 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards !important; }
.scale-out .flash-card-animation--right-restore { animation: scale-out-restore-right 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards !important; }
.scale-out .flash-card-animation--left-restore { animation: scale-out-restore-left 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards !important; }

@keyframes scale-out-right { 0%{opacity:1;} 100%{transform:translateX(300px) scale(0);opacity:0;} }
@keyframes scale-out-left { 0%{opacity:1;} 100%{transform:translateX(-300px) scale(0);opacity:0;} }
@keyframes scale-out-restore-right { 0%{transform:translateX(300px) scale(0);opacity:0;} 100%{transform:translateX(0) scale(1);opacity:1;} }
@keyframes scale-out-restore-left { 0%{transform:translateX(-300px) scale(0);opacity:0;} 100%{transform:translateX(0) scale(1);opacity:1;} }

/* 3D Flip Animation */
.flip-3d .flash-card-animation--right { animation: flip-3d-right 0.5s ease-in-out forwards !important; }
.flip-3d .flash-card-animation--left { animation: flip-3d-left 0.5s ease-in-out forwards !important; }
.flip-3d .flash-card-animation--right-restore { animation: flip-3d-restore-right 0.5s ease-in-out forwards !important; }
.flip-3d .flash-card-animation--left-restore { animation: flip-3d-restore-left 0.5s ease-in-out forwards !important; }

@keyframes flip-3d-right { 0%{opacity:1;} 100%{transform:translateX(300px) rotateY(180deg) rotateX(45deg);opacity:0;} }
@keyframes flip-3d-left { 0%{opacity:1;} 100%{transform:translateX(-300px) rotateY(-180deg) rotateX(45deg);opacity:0;} }
@keyframes flip-3d-restore-right { 0%{transform:translateX(300px) rotateY(180deg) rotateX(45deg);opacity:0;} 100%{transform:translateX(0) rotateY(0deg) rotateX(0deg);opacity:1;} }
@keyframes flip-3d-restore-left { 0%{transform:translateX(-300px) rotateY(-180deg) rotateX(45deg);opacity:0;} 100%{transform:translateX(0) rotateY(0deg) rotateX(0deg);opacity:1;} }

/* Elastic Bounce Animation */
.elastic-bounce .flash-card-animation--right { animation: elastic-bounce-right 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) forwards !important; }
.elastic-bounce .flash-card-animation--left { animation: elastic-bounce-left 0.4s cubic-bezier(0.55,0.055,0.675,0.19) forwards !important; }
.elastic-bounce .flash-card-animation--right-restore { animation: elastic-bounce-restore-right 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) forwards !important; }
.elastic-bounce .flash-card-animation--left-restore { animation: elastic-bounce-restore-left 0.4s cubic-bezier(0.55,0.055,0.675,0.19) forwards !important; }

@keyframes elastic-bounce-right { 0%{opacity:1;} 100%{transform:translateX(300px) scale(1.3) rotate(15deg);opacity:0;} }
@keyframes elastic-bounce-left { 0%{opacity:1;} 100%{transform:translateX(-300px) scale(1.3) rotate(-15deg);opacity:0;} }
@keyframes elastic-bounce-restore-right { 0%{transform:translateX(300px) scale(1.3) rotate(15deg);opacity:0;} 100%{transform:translateX(0) scale(1) rotate(0deg);opacity:1;} }
@keyframes elastic-bounce-restore-left { 0%{transform:translateX(-300px) scale(1.3) rotate(-15deg);opacity:0;} 100%{transform:translateX(0) scale(1) rotate(0deg);opacity:1;} }
</style>
