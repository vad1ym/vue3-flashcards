<script lang="ts" setup generic="T extends Record<string, unknown>">
import type { FlashCardProps } from './FlashCard.vue'
import type { DragPosition } from './utils/useDragSetup'
import type { StackDirection } from './utils/useStackTransform'
import { computed, ref } from 'vue'
import { config } from './config'
import FlashCard from './FlashCard.vue'
import { SwipeAction } from './utils/useDragSetup'
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

  /**
   * Wait for animation to end before performing next action
   */
  waitAnimationEnd?: boolean
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
  waitAnimationEnd = config.defaultWaitAnimationEnd,
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
    reset: () => void
    isEnd: boolean
    isStart: boolean
    canRestore: boolean
  }) => any
  empty?: () => any
}>()

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
  reset,
} = useStackList<T>(() => ({
  items,
  infinite,
  virtualBuffer: calculateVirtualBuffer.value,
  trackBy,
  waitAnimationEnd,
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
function handleCardSwipe(itemId: string | number, action: string, position: DragPosition = { x: 0, y: 0, delta: 0, type: null }) {
  const swipedCard = swipeCard(itemId, action, position)

  if (!swipedCard)
    return

  action === SwipeAction.APPROVE
    ? emit('approve', swipedCard)
    : emit('reject', swipedCard)
}

/**
 * Helper to perform card action
 */
function performCardAction(type: SwipeAction) {
  // If there's a card currently restoring, target that card instead of current card
  const restoringCard = cardsInTransition.value.filter(card => card.animation?.isRestoring).pop()
  const targetCard = restoringCard || stackList.value.find(item => item.index === currentIndex.value)

  return targetCard && handleCardSwipe(targetCard.itemId, type)
}

/**
 * Restores card
 */
function restore() {
  const restoredItem = restoreCard()
  return restoredItem && emit('restore', restoredItem)
}

/**
 * Approves card
 */
const approve = () => performCardAction('approve')

/**
 * Rejects card
 */
const reject = () => performCardAction('reject')

defineExpose({
  restore,
  approve,
  reject,
  reset,
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
        <slot name="empty" :reset="reset">
          No more cards!
        </slot>
      </div>
      <!-- Обычные карточки стека -->
      <div
        v-for="({ item, itemId, index }, domIndex) in stackList"
        :key="`stack-${itemId}`"
        :data-item-id="itemId"
        class="flashcards__card-wrapper"
        :style="[
          { zIndex: stackList.length - domIndex },
          getCardStyle(domIndex + cardsInTransition.filter(c =>
            c.animation?.isRestoring,
          ).length),
        ]"
      >
        <FlashCard
          v-bind="flashCardProps"
          class="flashcards__card"
          :class="{ 'flashcards__card--active': index === currentIndex }"
          @complete="(action, pos) => handleCardSwipe(itemId, action, pos)"
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
        v-for="({ item, itemId, animation, initialPosition }, domIndex) in cardsInTransition"
        :key="`anim-${itemId}`"
        :data-item-id="itemId"
        class="flashcards__card-wrapper flashcards__card-wrapper--animating"
        :style="[{ zIndex: stackList.length * 2 + domIndex }, getCardStyle(cardsInTransition.length - domIndex - 1)]"
      >
        <FlashCard
          v-bind="flashCardProps"
          class="flashcards__card flashcards__card--animating"
          :initial-position="initialPosition"
          :animation="animation"
          @animationend="() => removeAnimatingCard(itemId)"
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
      :reset="reset"
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
.flashcards-empty-state { grid-area:1/1; display:flex;align-items:center;justify-content:center; }
</style>
