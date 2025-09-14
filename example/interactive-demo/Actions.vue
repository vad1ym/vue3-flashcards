<script lang="ts" setup>
interface Props {
  isEnd: boolean
  isStart: boolean
  canRestore: boolean
  infinite: boolean
}

interface Emits {
  (e: 'restore'): void
  (e: 'reject'): void
  (e: 'approve'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="flex justify-center mt-16 gap-4">
    <button
      class="btn btn-circle btn-error"
      :disabled="isEnd && !infinite"
      @click="$emit('reject')"
    >
      ✗
    </button>
    <button
      class="btn btn-circle btn-neutral"
      :disabled="!canRestore"
      @click="$emit('restore')"
    >
      ↶
    </button>
    <button
      class="btn btn-circle btn-success"
      :disabled="isEnd && !infinite"
      @click="$emit('approve')"
    >
      ✓
    </button>
  </div>
  <div class="text-center mt-2 text-sm text-base-content/60">
    {{ isEnd && !infinite ? 'No more cards' : isStart ? 'Start' : 'Continue' }}
  </div>
</template>
