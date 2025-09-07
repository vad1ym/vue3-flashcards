<script lang="ts" setup generic="T extends Record<string, unknown>">
import type { FlashCardProps } from './FlashCard.vue'
import type { StackDirection } from './utils/useStackTransform'
import { computed, ref } from 'vue'
import { config } from './config'
import FlashCard from './FlashCard.vue'
import { useStackList } from './utils/useStackList'
import { useStackTransform } from './utils/useStackTransform'

export interface FlashCardsProps<Item> extends FlashCardProps {
  items?: Item[]

  // Enable infinite swiping
  infinite?: boolean

  // Count of cards to render in DOM
  virtualBuffer?: number

  // Show card as stacked (lower cards are scaled down and have offset)
  // Stack can't be greater than virtual buffer - 1
  stack?: number

  // Offset between stacked cards
  stackOffset?: number

  // Coefficient of the stack scale on each level
  stackScale?: number

  // Direction of the stack
  stackDirection?: StackDirection
}

const {
  items = [],
  infinite = false,
  virtualBuffer = config.defaultVirtualBuffer,
  stack = config.defaultStack,
  stackScale = config.defaultStackScale,
  stackOffset = config.defaultStackOffset,
  stackDirection = config.defaultStackDirection,
  ...flashCardProps
} = defineProps<FlashCardsProps<T>>()

const emit = defineEmits<{
  approve: [item: T]
  reject: [item: T]
}>()

defineSlots<{
  default: (props: { item: T }) => any
  reject?: (props: { item: T, delta: number }) => any
  approve?: (props: { item: T, delta: number }) => any
  actions?: (props: { restore: (animated?: boolean) => void, reject: () => void, approve: () => void, isEnd: boolean, canRestore: boolean }) => any
  empty?: () => any
}>()

// References to stack elements
const cardRefs = ref<Map<number, InstanceType<typeof FlashCard>>>(new Map())

// Keep height of last mounted element
const stackHeight = ref(0)

// Virtual buffer can't be less than 1
// Vritual buffer can't be less than stack + 1, when stack is passed
const getVirtualBuffer = computed(() => Math.max(stack + 1, virtualBuffer, 1))

// Use stack list composable
const {
  currentIndex,
  isEnd,
  canRestore,
  visibleItems,
  setApproval: setCardApproval,
  restoreCard,
} = useStackList<T>(() => ({
  items,
  infinite,
  virtualBuffer: getVirtualBuffer.value,
}))

// Use stack transform composable
const { getCardStyle } = useStackTransform(() => ({
  stack,
  stackScale,
  stackOffset,
  stackDirection,
  currentIndex: currentIndex.value,
  virtualBuffer: getVirtualBuffer.value,
}))

/**
 * Set the card as approved or rejected and emit event with the original item
 */
function setApproval(index: number, approved: boolean) {
  const originalItem = setCardApproval(index, approved)

  if (approved)
    emit('approve', originalItem)
  else
    emit('reject', originalItem)
}

/**
 * Find the previous card, reset and restore it, show restoring animation
 */
function restore() {
  if (restoreCard()) {
    cardRefs.value.get(currentIndex.value)?.restore()
  }
}

/**
 * Call approve method on the current card, show approval animation
 */
function approve() {
  cardRefs.value.get(currentIndex.value)?.approve()
}

/**
 * Call reject method on the current card, show rejection animation
 */
function reject() {
  cardRefs.value.get(currentIndex.value)?.reject()
}

defineExpose({
  restore,
  approve,
  reject,
  canRestore,
  isEnd,
})
</script>

<template>
  <div>
    <div class="flashcards" :style="{ height: isEnd ? `${stackHeight}px` : 'auto' }">
      <!-- Dont show empty state in infinite mode -->
      <!-- Show only within last card in finite mode -->
      <div
        v-if="!infinite && currentIndex >= items.length - 1"
        class="flashcards__card-wrapper flashcards-empty-state"
        :style="{ zIndex: -items.length - 1 }"
      >
        <slot name="empty">
          No more cards!
        </slot>
      </div>

      <!-- Virtual stack -->
      <div
        v-for="{ item, index, state } in visibleItems"
        :key="index"
        class="flashcards__card-wrapper"
        :style="[{ zIndex: currentIndex - index }, getCardStyle(index, state?.completed)]"
      >
        <FlashCard
          :ref="el => el && cardRefs.set(index, el as InstanceType<typeof FlashCard>)"
          v-bind="flashCardProps"
          :transition-type="state?.type"
          :transition-show="!state?.completed"
          class="flashcards__card"
          :class="{ 'flashcards__card--active': index === currentIndex }"
          @complete="setApproval(index, $event)"
          @mounted="stackHeight = Math.max($event, 0)"
        >
          <template #default>
            <slot :item="item" />
          </template>

          <template #reject="{ delta }">
            <slot name="reject" :item="item" :delta="delta" />
          </template>
          <template #approve="{ delta }">
            <slot name="approve" :item="item" :delta="delta" />
          </template>
        </FlashCard>
      </div>
    </div>

    <slot
      name="actions"
      :restore="restore"
      :reject="reject"
      :approve="approve"
      :is-end="isEnd"
      :can-restore="canRestore"
    />
  </div>
</template>

<style scoped>
.flashcards {
  position: relative;
  display: grid;
  grid-row: 1;
  isolation: isolate;
  overflow: visible;
  touch-action: none;
}

.flashcards__height-reference {
  opacity: 0;
  pointer-events: none;
}

.flashcards__card-wrapper {
  pointer-events: none;
  contain: layout;
  grid-area: 1 / 1;
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.flashcards__card {
  pointer-events: none;
}

.flashcards__card--active {
  pointer-events: all;
}

.flashcards-empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
