<script lang="ts" setup generic="T extends Record<string, unknown>">
import type { FlashCardProps } from './FlashCard.vue'
import { computed, reactive, ref } from 'vue'
import FlashCard from './FlashCard.vue'
import { DragType } from './utils/useDragSetup'

export interface FlashCardsProps<Item> extends FlashCardProps {
  items?: Item[]
  infinite?: boolean
  virtualBuffer?: number
}

const {
  items = [],
  infinite = false,
  virtualBuffer = 2,
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

const cardRefs = ref<Map<number, InstanceType<typeof FlashCard>>>(new Map())

interface CardState {
  completed?: boolean
  type?: DragType
}

const history = reactive<Map<number, CardState>>(new Map())
const currentIndex = ref(0)

/**
 * Returns item based on virtual index (for infinite mode)
 * Returns item based on index (for finite mode)
 */
function getItemAtIndex(index: number) {
  if (infinite) {
    return items[index % items.length]
  }
  return items[index]
}

// Indicates the start of the finite cards
const isStart = computed(() => currentIndex.value === 0)

// Indicates the end of finite cards
const isEnd = computed(() => currentIndex.value >= items.length)

// Indicates the ability to restore the previous card
const canRestore = computed(() => !isStart.value)

/**
 * Returns the visible items based on the current index and virtual buffer
 * Is used for virtualization
 */
const visibleItems = computed(() => {
  const start = Math.max(0, currentIndex.value - 1)
  const end = infinite
    ? currentIndex.value + virtualBuffer
    : Math.min(items.length - 1, currentIndex.value + virtualBuffer)

  return Array.from({ length: end - start + 1 }, (_, i) => {
    const index = start + i
    return {
      item: getItemAtIndex(index),
      index,
      state: history.get(index),
    }
  })
})

/**
 * Set the card as approved or rejected and emit event with the original item
 */
function setApproval(index: number, approved: boolean) {
  history.set(index, {
    type: approved ? DragType.APPROVE : DragType.REJECT,
    completed: true,
  })
  currentIndex.value++

  // Get the original item for emit
  const originalItem = getItemAtIndex(index)

  if (approved)
    emit('approve', originalItem)
  else
    emit('reject', originalItem)
}

/**
 * Find the previous card, reset and restore it, show restoring animation
 */
function restore() {
  if (isStart.value)
    return

  const previousIndex = currentIndex.value - 1
  const previousCardState = history.get(previousIndex)

  if (previousCardState) {
    previousCardState.completed = false
    currentIndex.value = previousIndex
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
    <div class="flashcards">
      <div class="flashcards__card-wrapper" :style="{ zIndex: -items.length - 1 }">
        <slot name="empty">
          No more cards!
        </slot>
      </div>

      <!-- This invisible card is needed to keep the height of the cards -->
      <div class="flashcards__height-reference">
        <slot :item="({} as T)" />
      </div>

      <div
        v-for="{ item, index, state } in visibleItems"
        :key="index"
        class="flashcards__card-wrapper"
        :style="{ zIndex: currentIndex - index }"
      >
        <FlashCard
          :ref="el => el && cardRefs.set(index, el as InstanceType<typeof FlashCard>)"
          v-bind="flashCardProps"
          :transition-type="state?.type"
          :transition-show="!state?.completed"
          class="flashcards__card"
          :class="{ 'flashcards__card--active': index === currentIndex }"
          @complete="setApproval(index, $event)"
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
  width: 100%;
  isolation: isolate;
  overflow: visible;
  touch-action: none;
  overscroll-behavior: none;
}

.flashcards__height-reference {
  opacity: 0;
  pointer-events: none;
}

.flashcards__card-wrapper {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  transform: translate3D(-50%, -50%, 0);
  pointer-events: none;
  touch-action: inherit;
  contain: layout;
}

.flashcards__card {
  pointer-events: none;
}

.flashcards__card--empty {
  text-align: center;
}

.flashcards__card--active {
  pointer-events: all;
  touch-action: inherit;
}
</style>
