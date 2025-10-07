import type { MaybeRefOrGetter } from 'vue'
import type { DragPosition } from './useDragSetup'
import { computed, reactive, shallowReactive, toValue, watch } from 'vue'

export interface StackItem<T> {
  item: T
  itemId: string | number
  stackIndex: number // Current position in stack (0 = top)
  isAnimating?: boolean
  animation?: {
    type: string
    isRestoring: boolean
    initialPosition?: DragPosition
  }
}

export interface StackListOptions<T> {
  items: T[]
  loop?: boolean
  renderLimit: number
  itemKey?: keyof T | 'id'
  waitAnimationEnd?: boolean
  onLoop?: () => void
}

export interface ResetOptions {
  animate?: boolean
  delay?: number
}

export function useStackList<T extends Record<string, unknown>>(_options: MaybeRefOrGetter<StackListOptions<T>>) {
  const options = computed(() => toValue(_options))

  // Swiping history
  const history = reactive<Map<string | number, string>>(new Map())

  // Cards that are currently animating (using Map for O(1) operations)
  const cardsInTransition = shallowReactive(new Map<string | number, StackItem<T>>())
  const hasCardsInTransition = computed(() => cardsInTransition.size > 0)

  // Generate ID for card
  function getId(item: T, index: number): string | number {
    if (!item)
      return index

    const trackKey = options.value.itemKey || 'id'
    return item[trackKey as keyof T] as string | number ?? index
  }

  // Current index - first uncompleted card
  // It is the pointer for the first card in the stack, to detect current active card
  const currentIndex = computed(() => {
    const { items } = options.value
    const idx = items.findIndex((item, index) => {
      const itemId = getId(item, index)
      // Skip if in history OR currently animating (not restoring)
      const isInHistory = history.has(itemId)
      const isAnimating = cardsInTransition.has(itemId)
      return !isInHistory && !isAnimating
    })
    const result = idx === -1 ? items.length : idx
    return result
  })

  // ID of the current card
  const currentItemId = computed(() => {
    const { items = [] } = options.value
    return getId(items[currentIndex.value], currentIndex.value)
  })

  // Expected index after restoring animation, to better handle isStart & isEnd
  const expectedIndex = computed(() => {
    const restoreCount = Array.from(cardsInTransition.values()).filter(card =>
      card.animation?.isRestoring,
    ).length
    return currentIndex.value - restoreCount
  })

  // For loop mode reset history on new cycle (when index points outside of source array)
  watch(currentIndex, (ci) => {
    const { loop, items, onLoop } = options.value
    if (loop && ci === items.length) {
      history.clear()
      // Don't clear cardsInTransition here - let animations finish naturally
      // But we need to prevent restore from finding cards from previous cycle
      onLoop?.() // New loop cycle started
    }
  })

  // Generate stack items with unified logic for loop and non-loop modes
  function generateStackItems(startIndex: number, limit: number, items: T[], loop: boolean): StackItem<T>[] {
    const result: StackItem<T>[] = []
    const len = items.length
    const animatingCardsAdded = new Set<string | number>()

    // First, add animating cards
    for (const [itemId, card] of cardsInTransition.entries()) {
      const originalIndex = items.findIndex((item, idx) => getId(item, idx) === itemId)
      if (originalIndex >= 0) {
        result.push({
          ...card,
          stackIndex: 0,
          isAnimating: true,
        })
        animatingCardsAdded.add(itemId)
      }
    }

    // Then add regular stack items
    for (let i = 0; i < limit; i++) {
      const index = loop ? (startIndex + i + len) % len : startIndex + i
      if (!loop && index >= len)
        break

      const item = items[index]
      const itemId = getId(item, index)

      if (!animatingCardsAdded.has(itemId)) {
        result.push({
          item,
          itemId,
          stackIndex: i, // Use i directly - it represents position in stack (0, 1, 2, ...)
          isAnimating: false,
        })
      }
    }

    return result
  }

  // Stack generation for rendering (unified list with all cards including animating)
  const stackList = computed(() => {
    const { renderLimit, items, loop = false } = options.value
    if (!items.length)
      return []

    return generateStackItems(currentIndex.value, renderLimit, items, loop)
  })

  // Is start is true if current index is 0
  const isStart = computed(() => expectedIndex.value === 0)

  // Is end is true if current index is greater or equal to items length
  const isEnd = computed(() => expectedIndex.value >= options.value.items.length)

  // Can restore is true if there is at least one completed card before current index
  // Also check animating card
  const canRestore = computed(() => {
    if (options.value.items.length <= 1 || expectedIndex.value === 0)
      return false

    const { items } = options.value

    // Check both history and cards currently being swiped (not restoring)
    for (let i = expectedIndex.value - 1; i >= 0; i--) {
      const id = getId(items[i], i)
      const card = cardsInTransition.get(id)
      const isSwipingCard = card && !card.animation?.isRestoring

      if (history.has(id) || isSwipingCard)
        return true
    }
    return false
  })

  // Helper function to add or replace card in transition
  function addOrReplaceCard(transitionCard: StackItem<T>) {
    const existing = cardsInTransition.get(transitionCard.itemId)

    // If card is already animating, update animation but keep it
    if (existing) {
      cardsInTransition.set(transitionCard.itemId, {
        ...existing,
        animation: transitionCard.animation,
      })
    }
    else {
      cardsInTransition.set(transitionCard.itemId, transitionCard)
    }
  }

  // Remove animating card and optionally clear from history
  function removeAnimatingCard(itemId: string | number) {
    const card = cardsInTransition.get(itemId)
    if (!card)
      return

    // If card was restored - remove card from history
    if (card.animation?.isRestoring) {
      history.delete(itemId)
    }
    else if (card.animation) {
      // Card finished swiping animation - NOW add to history
      history.set(itemId, card.animation.type)
    }

    // Remove card from transitions
    cardsInTransition.delete(itemId)
  }

  // -------------------
  // Swiping functions
  // -------------------
  function swipeCard(itemId: string | number, type: string, initialPosition?: DragPosition): T | undefined {
    const { items, waitAnimationEnd } = options.value

    // If some cards are in animation and waitAnimationEnd is true, prevent action
    if (hasCardsInTransition.value && waitAnimationEnd) {
      return
    }

    // Check if current item still exist in source items array
    const item = items.find((item, index) => getId(item, index) === itemId)
    if (!item) {
      return
    }

    addOrReplaceCard({
      item,
      itemId,
      stackIndex: 0, // Will be recalculated in generateStackItems
      animation: {
        type,
        isRestoring: false,
        initialPosition,
      },
    })

    // Don't update history yet - will be done after animation completes
    // This keeps currentIndex stable during animation
    // history.set(itemId, type)

    return item
  }

  // -------------------
  // Restore helpers
  // -------------------
  function isCardRestoring(itemId: string | number): boolean {
    return cardsInTransition.get(itemId)?.animation?.isRestoring ?? false
  }

  function findRestorableCard(): { item: T, itemId: string | number, action: string } | null {
    const { items } = options.value

    // Find the last swiped card by highest index in items array
    // Check both history and cards in transition
    // In loop mode, only search before currentIndex to avoid finding cards from previous cycle
    const searchLimit = expectedIndex.value

    for (let i = searchLimit - 1; i >= 0; i--) {
      const item = items[i]
      const itemId = getId(item, i)

      if (isCardRestoring(itemId))
        continue

      // Get action from history OR from currently swiping card
      const card = cardsInTransition.get(itemId)
      const action = history.get(itemId) || (card && !card.animation?.isRestoring ? card.animation?.type : null)

      if (action) {
        return { item, itemId, action }
      }
    }

    return null
  }

  // -------------------
  // Restore
  // -------------------
  function restoreCard(): T | undefined {
    if (!canRestore.value)
      return

    const restorableCard = findRestorableCard()
    if (!restorableCard)
      return

    const { item, itemId, action } = restorableCard

    addOrReplaceCard({
      item,
      itemId,
      stackIndex: 0, // Will be recalculated in generateStackItems
      animation: {
        // If we have running swipe transition, restore should revert it
        type: cardsInTransition.get(itemId)?.animation?.type || action,
        isRestoring: true,
      },
    })

    return item
  }

  // -------------------
  // Reset
  // -------------------
  async function reset(options?: ResetOptions) {
    // Reset with cascading effect
    if (options?.animate) {
      const completedCards = [...history.entries()]
      for (let i = 0; i < completedCards.length; i++) {
        if (restoreCard()) {
          // Delay before next card to make cascading effect
          await new Promise(resolve => setTimeout(resolve, options?.delay ?? 90))
        }
      }
      // History will be cleared by removeAnimatingCard when restore animations finish
    }
    else {
      // No animation - clear everything immediately
      history.clear()
      cardsInTransition.clear()
    }
  }

  return {
    history,
    currentIndex,
    isStart,
    isEnd,
    canRestore,
    stackList,
    swipeCard,
    restoreCard,
    removeAnimatingCard,
    reset,
    hasCardsInTransition,
    currentItemId,
    cardsInTransition: computed(() => Array.from(cardsInTransition.values())),
  }
}
