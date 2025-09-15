<script lang="ts" setup generic="T extends Record<string, unknown>">
import type { FlashCardProps } from './FlashCard.vue'
import type { DragPosition } from './utils/useDragSetup'
import type { StackDirection } from './utils/useStackTransform'
import { computed, ref } from 'vue'
import { config } from './config'
import FlashCard from './FlashCard.vue'
import { useStackList } from './utils/useStackList'
import { useStackTransform } from './utils/useStackTransform'

export interface FlashCardsProps<Item> extends FlashCardProps {
  /**
   * Array of items to display as cards
   */
  items?: Item[]
  /**
   * Enable infinite swiping mode
   */
  infinite?: boolean
  /**
   * Number of cards to render in dom, cant be less than 1. If stack is greater it will override this value
   */
  virtualBuffer?: number
  /**
   * Number of cards to stack
   */
  stack?: number
  /**
   * Offset for stack
   */
  stackOffset?: number
  /**
   * Scale factor for stack
   */
  stackScale?: number
  /**
   * Direction for stack
   */
  stackDirection?: StackDirection
  /**
   * Key to track items by (is required if you are going to modify items array)
   */
  trackBy?: keyof Item | 'id'
}

const {
  items = [],
  infinite = false,
  virtualBuffer = config.defaultVirtualBuffer,
  stack = config.defaultStack,
  stackScale = config.defaultStackScale,
  stackOffset = config.defaultStackOffset,
  stackDirection = config.defaultStackDirection,
  trackBy = config.defaultTrackBy,
  ...flashCardProps
} = defineProps<FlashCardsProps<T>>()

const emit = defineEmits<{
  approve: [item: T]
  reject: [item: T]
  restore: [item: T]
}>()

defineSlots<{
  default: (props: { item: T }) => any
  reject?: (props: { item: T, delta: number }) => any
  approve?: (props: { item: T, delta: number }) => any
  actions?: (props: {
    restore: () => void
    reject: () => void
    approve: () => void
    isEnd: boolean
    isStart: boolean
    canRestore: boolean
  }) => any
  empty?: () => any
}>()

const cardInstanceRefs = ref<Map<number, InstanceType<typeof FlashCard>>>(new Map())
const containerHeight = ref(0)

/**
 * VIRTUAL BUFFER
 * The minimal buffer value is 1
 * Passed virtual buffer value is used as is
 * If stack is not 0, it can be used to override virtual buffer if it's lower than stack + 2
 * IMPORTANT: We add 2 to stack value to account for the current card and hidden transition card
 */
const calculateVirtualBuffer = computed(() => Math.max(stack && stack + 2, virtualBuffer, 1))

/**
 * STACK LIST
 * Stack list is used to render cards both finite and infinite mods, calculate indices, positions etc
 */
const {
  currentIndex,
  isEnd,
  isStart,
  canRestore,
  stackList,
  cardsInTransition,
  swipeCard,
  restoreCard,
  removeAnimatingCard,
} = useStackList<T>(() => ({
  items,
  infinite,
  virtualBuffer: calculateVirtualBuffer.value,
  trackBy,
}))

/**
 * STACK TRANSFORM
 * Stack transform is used to calculate card styles for stacking mode
 */
const {
  getCardStyle,
} = useStackTransform(() => ({
  stack,
  stackScale,
  stackOffset,
  stackDirection,
  currentIndex: currentIndex.value,
  virtualBuffer: calculateVirtualBuffer.value,
}))

/**
 * Handles card swipe completion
 */
function handleCardSwipe(item: T, itemId: string | number, approved: boolean, position: DragPosition = { x: 0, y: 0, delta: 0, type: null }) {
  swipeCard(itemId, approved, position)
  approved ? emit('approve', item) : emit('reject', item)
}

/**
 * Helper to perform card action
 */
function performCardAction(type: 'approve' | 'reject' | 'restore') {
  if (type === 'restore') {
    const restoredItem = restoreCard()
    if (restoredItem) {
      emit('restore', restoredItem)
    }
    return
  }

  // If there's a card currently restoring, target that card instead of current card
  const restoringCard = cardsInTransition.value.find(card => card.animationType === 'restore')
  const targetCard = restoringCard || stackList.value.find(item => item.index === currentIndex.value)

  if (!targetCard)
    return

  handleCardSwipe(targetCard.item, targetCard.itemId, type === 'approve')
}

/**
 * Approves card
 */
const approve = () => performCardAction('approve')

/**
 * Rejects card
 */
const reject = () => performCardAction('reject')

/**
 * Restores card
 */
const restore = () => performCardAction('restore')

defineExpose({
  restore,
  approve,
  reject,
  canRestore,
  isEnd,
  isStart,
})
</script>

<template>
  <div>
    <div class="flashcards" :style="{ height: containerHeight ? `${containerHeight}px` : 'auto' }">
      <div
        v-if="!infinite && currentIndex >= items.length - 1"
        key="empty-state"
        class="flashcards-empty-state"
      >
        <slot name="empty">
          No more cards!
        </slot>
      </div>
      <!-- Обычные карточки стека -->
      <div
        v-for="({ item, itemId, index, zIndex }, domIndex) in stackList"
        :key="`stack-${itemId}`"
        :data-item-id="itemId"
        class="flashcards__card-wrapper"
        :style="[
          { zIndex },
          getCardStyle(domIndex + cardsInTransition.filter(c => c.animationType === 'restore').length),
        ]"
      >
        <FlashCard
          :ref="el => el && cardInstanceRefs.set(index, el as InstanceType<typeof FlashCard>)"
          v-bind="flashCardProps"
          class="flashcards__card"
          :class="{ 'flashcards__card--active': index === currentIndex }"
          @complete="(approved, pos) => handleCardSwipe(item, itemId, approved, pos)"
          @mounted="containerHeight = Math.max($event, 0)"
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

      <!-- Animating cards -->
      <div
        v-for="({ item, itemId, state, zIndex, animationType, initialPosition }, domIndex) in cardsInTransition"
        :key="`anim-${itemId}-${animationType}`"
        :data-item-id="itemId"
        class="flashcards__card-wrapper flashcards__card-wrapper--animating"
        :style="[{ zIndex }, getCardStyle(cardsInTransition.length - domIndex - 1)]"
      >
        <FlashCard
          v-bind="flashCardProps"
          class="flashcards__card flashcards__card--animating"
          :initial-position="initialPosition"
          :animation-type="animationType"
          :animation-state="state?.type"
          @animationend="() => removeAnimatingCard(itemId, { withHistory: animationType === 'restore' })"
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
      :is-start="isStart"
      :can-restore="canRestore"
    />
  </div>
</template>

<style scoped>
.flashcards {
  position: relative;
  display: grid;
  isolation: isolate;
  overflow: visible;
}
.flashcards__card-wrapper {
  pointer-events: none;
  contain: layout;
  grid-area: 1 / 1;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1);
}
.flashcards__card--active { pointer-events: all; }
.flashcards-empty-state { grid-area:1/1; display:flex;align-items:center;justify-content:center;pointer-events:none; }
</style>
