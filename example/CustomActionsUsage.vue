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
      <FlashCards :items="cards">
        <template #default="{ item }">
          <div class="p-5 bg-base-200 border border-base-300 shadow-lg rounded-lg h-40 flex justify-center items-center">
            <div>{{ item.text }}</div>
          </div>
        </template>

        <template #actions="{ approve, reject, restore }">
          <div class="grid grid-cols-2 gap-5 mt-5">
            <div class="btn btn-error" @click="reject">
              Reject
            </div>
            <div class="btn btn-primary" @click="approve">
              Approve
            </div>
            <div class="col-span-2 btn" @click="restore">
              Restore
            </div>
          </div>
        </template>
      </FlashCards>
    </div>
  </div>
</template>
