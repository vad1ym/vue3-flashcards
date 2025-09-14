<script lang="ts" setup>
import type { CardItem } from './InteractiveCard.vue'
import { nextTick, ref } from 'vue'

interface Event {
  type: 'approve' | 'reject'
  item: CardItem
  timestamp: string
}

interface Props {
  events: Event[]
}

interface Emits {
  (e: 'clearEvents'): void
}

defineProps<Props>()
defineEmits<Emits>()

const eventsContainer = ref<HTMLElement>()

function scrollToBottom() {
  nextTick(() => {
    if (eventsContainer.value) {
      eventsContainer.value.scrollTop = eventsContainer.value.scrollHeight
    }
  })
}

// Expose the scroll function to parent
defineExpose({
  scrollToBottom,
})
</script>

<template>
  <div class="overflow-hidden h-full">
    <div class="card bg-gray-900 text-green-400 shadow-lg h-full">
      <div class="card-body p-4 flex flex-col h-full overflow-hidden">
        <div class="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 class="text-xs font-mono text-green-300">
            > flashcards.log
          </h3>
          <button
            v-if="events.length > 0"
            class="btn btn-ghost btn-xs text-green-300 hover:text-green-100"
            @click="$emit('clearEvents')"
          >
            clear
          </button>
        </div>
        <div ref="eventsContainer" class="flex-1 overflow-y-auto font-mono text-xs leading-relaxed">
          <div v-if="events.length === 0" class="text-green-600 opacity-60">
            $ waiting for events...
          </div>
          <div
            v-for="(event, index) in events"
            :key="index"
            class="flex items-start gap-2 py-0.5"
            :class="event.type === 'approve' ? 'text-green-400' : 'text-red-400'"
          >
            <span class="text-gray-500 shrink-0">{{ event.timestamp }}</span>
            <span class="shrink-0">{{ event.type === 'approve' ? '[✓]' : '[✗]' }}</span>
            <span class="text-gray-300">{{ event.type }}:</span>
            <span class="truncate">{{ event.item.title }} (id={{ event.item.id }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
