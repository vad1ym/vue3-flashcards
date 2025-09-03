<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards, FlipCard } from '../src'
import './assets/index.css'

const cards = ref([
  { text: 'Front 1', back: 'Back 1' },
  { text: 'Front 2', back: 'Back 2' },
  { text: 'Front 3', back: 'Back 3' },
])

const waitAnimationEnd = ref(true)
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center py-20">
    <div class="mb-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="waitAnimationEnd"
          type="checkbox"
          class="toggle"
        >
        <span>Wait for animation end</span>
      </label>
    </div>

    <div class="max-w-sm w-full">
      <FlashCards :items="cards">
        <template #default="{ item }">
          <FlipCard :wait-animation-end="waitAnimationEnd">
            <template #front>
              <div class="p-5 bg-base-200 border border-base-300 shadow-lg rounded-lg h-40 flex justify-center items-center">
                <div>{{ item.text }}</div>
              </div>
            </template>
            <template #back>
              <div class="p-5 bg-base-200 border border-base-300 shadow-lg rounded-lg h-40 flex justify-center items-center">
                <div>{{ item.back }}</div>
              </div>
            </template>
          </FlipCard>
        </template>
      </FlashCards>
    </div>
  </div>
</template>
