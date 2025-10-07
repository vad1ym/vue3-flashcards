<script lang="ts" setup>
interface Props {
  isEnd: boolean
  isStart: boolean
  canRestore: boolean
  loop: boolean
}

interface Emits {
  (e: 'restore'): void
  (e: 'reject'): void
  (e: 'approve'): void
  (e: 'reset', options?: { animate?: boolean }): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="w-full flex justify-between gap-4 flex-wrap mt-16">
    <div class="flex justify-center gap-2">
      <button
        class="btn btn-primary"
        :disabled="isStart"
        @click="$emit('reset')"
      >
        Reset
      </button>
      <button
        class="btn btn-primary"
        :disabled="isStart"
        @click="$emit('reset', { animate: true })"
      >
        Anim. reset
      </button>
    </div>
    <div class="flex justify-center gap-1">
      <button
        class="btn btn-circle btn-error"
        :disabled="isEnd && !loop"
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
        :disabled="isEnd && !loop"
        @click="$emit('approve')"
      >
        ✓
      </button>
    </div>
  </div>
</template>
