<script lang="ts" setup generic="T extends Record<string, unknown>">
import type { FlashCardProps } from './FlashCard.vue'
import type { A11yProp } from './utils/useA11y'
import type { Direction, DragPosition } from './utils/useDragSetup'
import type { ResetOptions } from './utils/useStackList'
import type { StackDirection } from './utils/useStackTransform'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { flashCardsDefaults } from './config/flashcards.config'
import FlashCard from './FlashCard.vue'
import { directionForKey, useA11y } from './utils/useA11y'
import { useFlashCardsConfig } from './utils/useConfig'
import { SwipeAction } from './utils/useDragSetup'
import { useStackList } from './utils/useStackList'
import { useStackTransform } from './utils/useStackTransform'

export interface FlashCardsProps<Item> extends Omit<FlashCardProps, 'direction'> {
  /**
   * Array of items to display as cards
   */
  items?: Item[]

  /**
   * Direction of swiping: horizontal (left/right), vertical (up/down),
   * or array of specific directions for custom combinations
   */
  swipeDirection?: Direction[] | 'horizontal' | 'vertical'
  /**
   * Enable loop swiping mode
   */
  loop?: boolean
  /**
   * Number of cards to render in dom, cant be less than 1. If stack is greater it will override this value
   */
  renderLimit?: number
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
  itemKey?: keyof Item | 'id'

  /**
   * Wait for animation to end before performing next action
   */
  waitAnimationEnd?: boolean

  /**
   * Accessibility options. ON by default — keyboard navigation, ARIA roles, a
   * live-region announcer and focus management all work out of the box. Pass an
   * object to tune labels / behavior, or `false` to opt out entirely and supply
   * your own a11y. See `A11yOptions`.
   */
  a11y?: A11yProp
}

const props = withDefaults(defineProps<FlashCardsProps<T>>(), {
  items: () => [],
  ...flashCardsDefaults,
})

const emit = defineEmits<{
  // Directional swipe events
  swipeTop: [item: T]
  swipeLeft: [item: T]
  swipeRight: [item: T]
  swipeBottom: [item: T]

  // Other events
  restore: [item: T]
  skip: [item: T]
  loop: []
  dragstart: [item: T]
  dragmove: [item: T, type: SwipeAction | null, delta: number]
  dragend: [item: T]
}>()

defineSlots<{
  default: (props: { item: T, activeItemKey: string | number }) => any

  // Directional indicator slots
  top?: (props: { item: T, delta: number }) => any
  left?: (props: { item: T, delta: number }) => any
  right?: (props: { item: T, delta: number }) => any
  bottom?: (props: { item: T, delta: number }) => any

  empty?: (props: { reset: (options?: ResetOptions) => void }) => any

  actions?: (props: {
    restore: () => void
    skip: () => void
    reset: (options?: ResetOptions) => void

    swipeTop: () => void
    swipeLeft: () => void
    swipeRight: () => void
    swipeBottom: () => void

    isEnd: boolean
    isStart: boolean
    canRestore: boolean
  }) => any
}>()

// Extract props that should be passed to FlashCard (excluding ones we handle specially)
const otherProps = computed(() => {
  const { items, swipeDirection, loop, renderLimit, stack, stackOffset, stackScale, stackDirection, itemKey, waitAnimationEnd, a11y, ...rest } = props
  return rest
})

const containerHeight = ref(0)

// Merge props with global config
const config = useFlashCardsConfig(() => props)

/**
 * Convert swipeDirection presets to directional arrays
 * This maintains backward compatibility while the core system uses only arrays
 */
const effectiveSwipeDirection = computed(() => {
  if (props.swipeDirection === 'horizontal') {
    return ['left', 'right'] as Direction[]
  }
  if (props.swipeDirection === 'vertical') {
    return ['top', 'bottom'] as Direction[]
  }
  if (Array.isArray(props.swipeDirection)) {
    return props.swipeDirection as Direction[]
  }

  // Default to horizontal for backward compatibility
  return ['left', 'right'] as Direction[]
})

/**
 * RENDER LIMIT
 * The minimal limit value is 1
 * Passed limit value is used as is
 * If stack is not 0, it can be used to override limit if it's lower than stack + 2
 * IMPORTANT: We add 2 to stack value to account for the current card and hidden transition card
 */
const renderLimit = computed(() => Math.max(config.value.stack > 0 ? config.value.stack + 2 : config.value.renderLimit, 1))

/**
 * STACK LIST
 * Stack list is used to render cards both finite and loop mods, calculate indices, positions etc
 */
const {
  currentIndex,
  isEnd,
  isStart,
  canRestore,
  stackList,
  hasCardsInTransition,
  swipeCard,
  swipeActive,
  restoreCard,
  removeAnimatingCard,
  reset,
  currentItemId,
} = useStackList<T>(() => ({
  ...config.value,
  items: props.items,
  renderLimit: renderLimit.value,
  swipeDirection: effectiveSwipeDirection.value,
  onLoop: () => emit('loop'),
}))

/**
 * STACK TRANSFORM
 * Stack transform is used to calculate card styles for stacking mode
 */
const {
  getCardStyle,
} = useStackTransform(() => ({
  ...config.value,
  swipeDirection: effectiveSwipeDirection.value,
}))

/**
 * ACCESSIBILITY
 * Resolves the `a11y` prop, builds live-region announcements and card labels.
 * Kept as one object (not destructured) so the template reads `a11y.enabled`,
 * `a11y.labels.card`, etc. instead of a dozen loose refs.
 */
const a11y = useA11y(() => props.a11y)
const { announce } = a11y

// Remaining cards (active card + everything after it not yet swiped).
const remaining = computed(() => Math.max(props.items.length - currentIndex.value, 0))

// The deck container — focus target and keydown host.
const deckEl = useTemplateRef<HTMLElement>('deck')

/**
 * PEEK
 * A ref to the active FlashCard, set in the template only for the active card,
 * so its exposed `peek()` can be driven programmatically (hints, etc).
 */
const activeCardRef = ref<{ peek: (percent: number, direction: Direction) => void } | null>(null)

// Capture the active card's instance (set from the template only for the active,
// non-animating card) so `peek()` can drive it.
function setActiveCardRef(itemId: string | number, isAnimating: boolean | undefined, instance: any) {
  if (itemId === currentItemId.value && !isAnimating)
    activeCardRef.value = instance
}

/**
 * Determines if drag should be disabled on cards
 *
 * Drag is disabled when:
 * - `disableDrag` prop is explicitly set to true
 * - `waitAnimationEnd` is enabled AND there are cards currently in transition
 *   This prevents race conditions where a user can drag a new card while
 *   the previous card is still animating, which causes cards to hang/freeze
 */
const isDragDisabled = computed(() => props.disableDrag || (config.value.waitAnimationEnd && hasCardsInTransition.value))

/**
 * Emits the directional swipe event for a card that has just been swiped.
 */
function emitSwipeEvents(action: SwipeAction, swipedCard: T) {
  if (action === SwipeAction.TOP) {
    emit('swipeTop', swipedCard)
  }
  else if (action === SwipeAction.LEFT) {
    emit('swipeLeft', swipedCard)
  }
  else if (action === SwipeAction.RIGHT) {
    emit('swipeRight', swipedCard)
  }
  else if (action === SwipeAction.BOTTOM) {
    emit('swipeBottom', swipedCard)
  }
  else if (action === SwipeAction.SKIP) {
    emit('skip', swipedCard)
  }
}

/**
 * Handles card swipe completion from a drag gesture (the card id is known).
 */
function handleCardSwipe(itemId: string | number, action: SwipeAction, position: DragPosition = { x: 0, y: 0, delta: 0, type: null }) {
  const swipedCard = swipeCard(itemId, action, position)
  if (swipedCard) {
    emitSwipeEvents(action, swipedCard)
    announceAfterSwipe(action)
  }
}

/**
 * After a swipe settles, announce it to assistive tech and (if the deck just
 * emptied) the empty state. Runs on `nextTick` so `remaining`/`isEnd` reflect
 * the advanced cursor.
 */
function announceAfterSwipe(action: SwipeAction) {
  nextTick(() => {
    if (isEnd.value)
      announce('empty', remaining.value)
    else
      announce('swipe', remaining.value, action)
  })
}

/**
 * Handles drag move events
 */
function handleDragMove(item: T, type: SwipeAction | null, delta: number) {
  emit('dragmove', item, type, delta)
}

/**
 * Performs a button-triggered swipe. The core picks the right target (the
 * current card, or a mid-restore card so restore → next cancels cleanly).
 */
function performCardAction(type: SwipeAction) {
  const swipedCard = swipeActive(type)
  if (swipedCard) {
    emitSwipeEvents(type, swipedCard)
    announceAfterSwipe(type)
  }
}

/**
 * Restores card
 */
function restore() {
  // If some cards is in animation and waitAnimationEnd is true, prevent action
  if (hasCardsInTransition.value && config.value.waitAnimationEnd) {
    return
  }

  const restoredItem = restoreCard()
  if (restoredItem) {
    emit('restore', restoredItem)
    nextTick(() => announce('restore', remaining.value))
  }
  return restoredItem
}

/**
 * Directional card actions
 */
const swipeTop = () => performCardAction(SwipeAction.TOP)
const swipeLeft = () => performCardAction(SwipeAction.LEFT)
const swipeRight = () => performCardAction(SwipeAction.RIGHT)
const swipeBottom = () => performCardAction(SwipeAction.BOTTOM)

/**
 * Declarative swipe — `swipe('left')` is the same as `swipeLeft()`. Handy when
 * the direction is dynamic.
 */
const swipe = (direction: Direction) => performCardAction(direction as SwipeAction)

/**
 * Skips card - moves to end without swiping in any direction
 */
const skip = () => performCardAction(SwipeAction.SKIP)

/**
 * Peek the active card to `percent` (0-1) of the swipe threshold along
 * `direction`, applying the live `transformStyle`/indicators without completing
 * the swipe. `peek(0, dir)` settles back to center. Handy for hint "wobbles" and
 * for building a confirm-before-swipe flow.
 */
function peek(percent: number, direction: Direction) {
  activeCardRef.value?.peek(percent, direction)
}

// -------------------------------------------------------------------------
// Keyboard navigation. An arrow key maps to an enabled swipe direction; Enter /
// Space triggers the primary positive action; Backspace / "z" restores.
//
// With `confirmOnKey`, the first arrow press peeks the card to its full
// pre-swipe pose and remembers the pending direction — a second matching press
// or Enter/Space confirms it, Escape (or a different arrow) cancels.
// -------------------------------------------------------------------------
const pendingDirection = ref<Direction | null>(null)

/** The "primary" positive direction for Enter/Space (right, else first enabled). */
const primaryDirection = computed<Direction>(() => {
  const enabled = effectiveSwipeDirection.value
  return enabled.includes('right') ? 'right' : enabled[0] ?? 'right'
})

function cancelPending() {
  if (pendingDirection.value) {
    peek(0, pendingDirection.value)
    pendingDirection.value = null
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!a11y.keyboard.value || isEnd.value)
    return

  const dir = directionForKey(event.key, effectiveSwipeDirection.value)

  // Restore keys.
  if (event.key === 'Backspace' || event.key === 'z' || event.key === 'Z') {
    if (canRestore.value) {
      event.preventDefault()
      cancelPending()
      restore()
    }
    return
  }

  // Cancel a pending confirm.
  if (event.key === 'Escape') {
    if (pendingDirection.value) {
      event.preventDefault()
      cancelPending()
    }
    return
  }

  // Confirm keys.
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault()
    const target = pendingDirection.value ?? primaryDirection.value
    pendingDirection.value = null
    performCardAction(target as SwipeAction)
    return
  }

  // Directional arrow keys.
  if (dir) {
    event.preventDefault()
    if (a11y.confirmOnKey.value) {
      if (pendingDirection.value === dir) {
        // Second press of the same arrow confirms.
        pendingDirection.value = null
        performCardAction(dir as SwipeAction)
      }
      else {
        // Switch the peek to the new direction and await confirmation.
        pendingDirection.value = dir
        peek(1, dir)
      }
    }
    else {
      performCardAction(dir as SwipeAction)
    }
  }
}

// -------------------------------------------------------------------------
// Focus management. After a keyboard-driven swipe, move focus to the next active
// card so the user keeps a focus anchor; if the deck emptied, focus the deck
// container (which holds the empty state). Only runs when the deck currently
// holds focus, so we never steal it from elsewhere on the page.
// -------------------------------------------------------------------------
function deckHasFocus() {
  return !!deckEl.value && deckEl.value.contains(document.activeElement)
}

function focusActiveCard() {
  if (!a11y.manageFocus.value || !deckHasFocus())
    return
  nextTick(() => {
    const el = deckEl.value?.querySelector<HTMLElement>('[data-active-card="true"]')
    if (el)
      el.focus()
    else
      deckEl.value?.focus()
  })
}

// Re-focus whenever the active card changes (a swipe/restore advanced it).
watch(currentItemId, () => focusActiveCard())

defineExpose({
  // Directional swipe methods
  swipe,
  swipeTop,
  swipeLeft,
  swipeRight,
  swipeBottom,
  skip,

  // Other methods
  restore,
  reset,
  peek,
  canRestore,
  isEnd,
  isStart,
})
</script>

<template>
  <div>
    <div
      ref="deck"
      class="flashcards"
      :style="{ height: containerHeight ? `${containerHeight}px` : 'auto' }"
      :role="a11y.enabled.value ? 'group' : undefined"
      :aria-roledescription="a11y.enabled.value ? a11y.labels.value.deck : undefined"
      :aria-label="a11y.enabled.value ? a11y.labels.value.deck : undefined"
      :tabindex="a11y.enabled.value && a11y.keyboard.value ? 0 : undefined"
      :aria-keyshortcuts="a11y.enabled.value && a11y.keyboard.value ? 'ArrowLeft ArrowRight ArrowUp ArrowDown Enter' : undefined"
      @keydown="handleKeydown"
    >
      <!-- Visually-hidden live region: screen readers announce swipes / restores
           / the empty state. -->
      <div
        v-if="a11y.enabled.value"
        class="flashcards__sr-only"
        :aria-live="a11y.liveMode.value"
        aria-atomic="true"
        role="status"
      >
        {{ a11y.announcement.value }}
      </div>
      <!-- Visually-hidden keyboard instructions. -->
      <div v-if="a11y.enabled.value && a11y.keyboard.value" class="flashcards__sr-only">
        {{ a11y.labels.value.instructions }}
      </div>
      <div
        v-if="!loop && currentIndex >= items.length - 1"
        key="empty-state"
        class="flashcards-empty-state"
      >
        <slot name="empty" :reset="reset">
          No more cards!
        </slot>
      </div>
      <!-- Unified card list - single v-for -->
      <div
        v-for="({ item, itemId, stackIndex, isAnimating, flight }, domIndex) in stackList"
        :key="`card-${itemId}`"
        :data-item-id="itemId"
        :data-active-card="a11y.enabled.value && itemId === currentItemId && !isAnimating ? 'true' : undefined"
        class="flashcards__card-wrapper"
        :class="{ 'flashcards__card-wrapper--animating': isAnimating }"
        :style="[
          {
            zIndex: isAnimating
              ? stackList.length * 2 + domIndex
              : stackList.length - domIndex,
          },
          getCardStyle(stackIndex),
        ]"
        :role="a11y.enabled.value ? 'group' : undefined"
        :aria-roledescription="a11y.enabled.value ? a11y.labels.value.card : undefined"
        :aria-label="a11y.enabled.value ? a11y.cardLabel(currentIndex, items.length) : undefined"
        :aria-hidden="a11y.enabled.value && !(itemId === currentItemId && !isAnimating) ? 'true' : undefined"
        :tabindex="a11y.enabled.value && itemId === currentItemId && !isAnimating ? -1 : undefined"
      >
        <FlashCard
          :ref="(instance) => setActiveCardRef(itemId, isAnimating, instance)"
          v-bind="otherProps"
          :direction="effectiveSwipeDirection"
          class="flashcards__card"
          :class="{
            'flashcards__card--active': itemId === currentItemId && !isAnimating,
            'flashcards__card--animating': isAnimating,
          }"
          :flight="isAnimating ? flight : undefined"
          :disable-drag="isDragDisabled || isAnimating"
          @complete="(action, pos) => handleCardSwipe(itemId, action, pos)"
          @mounted="containerHeight = Math.max($event, 0)"
          @animationend="() => removeAnimatingCard(itemId)"
          @dragstart="emit('dragstart', item)"
          @dragmove="(type, delta) => handleDragMove(item, type, delta)"
          @dragend="emit('dragend', item)"
        >
          <template #default>
            <slot :item="item" :active-item-key="currentItemId" />
          </template>

          <!-- Directional indicator slots -->
          <!-- Only pass slots if parent provided them, otherwise FlashCard uses its default content -->
          <template #top="slotProps">
            <slot v-if="$slots.top" name="top" :item="item" :delta="slotProps.delta" />
          </template>

          <template #bottom="slotProps">
            <slot v-if="$slots.bottom" name="bottom" :item="item" :delta="slotProps.delta" />
          </template>

          <template #left="slotProps">
            <slot v-if="$slots.left" name="left" :item="item" :delta="slotProps.delta" />
          </template>

          <template #right="slotProps">
            <slot v-if="$slots.right" name="right" :item="item" :delta="slotProps.delta" />
          </template>
        </FlashCard>
      </div>
    </div>

    <slot
      name="actions"
      :restore="restore"
      :skip="skip"
      :reset="reset"
      :swipe-top="swipeTop"
      :swipe-left="swipeLeft"
      :swipe-right="swipeRight"
      :swipe-bottom="swipeBottom"
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
/* Keep keyboard focus from drawing a box around the whole deck. */
.flashcards:focus { outline: none; }
.flashcards:focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }
/* Visually hidden, still read by assistive tech (live region & instructions). */
.flashcards__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
