<script lang="ts" setup>
import { ref } from 'vue'
import { FlashCards } from '../src'
import './assets/index.css'

const cards = ref([
  { text: 'Front 1' },
  { text: 'Front 2' },
  { text: 'Front 3' },
])
</script>

<template>
  <div class="w-full flex justify-center items-center py-20">
    <div class="max-w-sm w-full">
      <FlashCards :items="cards" #="{ item }">
        <div class="p-5 bg-base-200 border border-base-300 shadow-lg rounded-lg h-40 flex justify-center items-center">
          <div>{{ item.text }}</div>
        </div>
      </FlashCards>
    </div>
  </div>
</template>
