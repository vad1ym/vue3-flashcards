<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards, FlipCard } from '../src'
import './assets/index.css'

const cards = ref([
  { text: 'Front 1', back: 'Back 1' },
  { text: 'Front 2', back: 'Back 2' },
  { text: 'Front 3', back: 'Back 3' },
])
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center py-20">
    <div class="max-w-sm w-full">
      <FlashCards :items="cards">
        <template #default="{ item }">
          <FlipCard>
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
