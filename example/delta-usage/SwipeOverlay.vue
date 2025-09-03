<script setup lang="ts">
defineProps<{
  delta: number
  type: 'approve' | 'reject'
}>()
</script>

<template>
  <div
    v-if="type === 'approve'"
    class="absolute inset-0 flex items-center justify-center bg-emerald-500/90 rounded-2xl font-bold text-2xl text-white backdrop-blur-sm"
    :style="{ opacity: delta }"
  >
    <div class="text-center">
      <div class="text-4xl mb-2">
        ✅
      </div>
      <div>I know this!</div>
    </div>
  </div>
  <div
    v-else
    class="absolute inset-0 flex items-center justify-center bg-red-500/90 rounded-2xl font-bold text-2xl text-white backdrop-blur-sm"
    :style="{ opacity: delta }"
  >
    <div class="text-center">
      <div class="text-4xl mb-2">
        📚
      </div>
      <div>Need to review</div>
    </div>
  </div>
</template>
