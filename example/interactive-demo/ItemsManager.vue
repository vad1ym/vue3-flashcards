<script lang="ts" setup>
export interface CardItem {
  id: number
  emoji: string
  title: string
  subtitle: string
  color: string
}

interface Props {
  items: CardItem[]
}

interface Emits {
  (e: 'addItem'): void
  (e: 'removeItem'): void
  (e: 'resetItems'): void
  (e: 'resetConfig'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-base-content/80">
          🗂️ Items Management
        </h3>
        <div class="text-xs text-base-content/60">
          {{ items.length }} cards total
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          class="btn btn-xs btn-success"
          @click="$emit('addItem')"
        >
          <span class="text-xs">✨</span>
          Add
        </button>
        <button
          class="btn btn-xs btn-warning"
          :disabled="items.length <= 1"
          @click="$emit('removeItem')"
        >
          <span class="text-xs">🗑️</span>
          Remove
        </button>
        <button
          class="btn btn-xs btn-outline btn-info"
          @click="$emit('resetItems')"
        >
          <span class="text-xs">🔄</span>
          Reset Items
        </button>
        <button
          class="btn btn-xs btn-outline btn-secondary"
          @click="$emit('resetConfig')"
        >
          <span class="text-xs">⚙️</span>
          Reset Config
        </button>
      </div>
    </div>
  </div>
</template>
