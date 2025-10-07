import type { MaybeRefOrGetter } from 'vue'
import type { DragPosition } from './useDragSetup'
import { computed, reactive, shallowReactive, toValue, watch } from 'vue'

export interface StackItem<T> {
  item: T
  itemId: string | number
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
    const idx = items.findIndex((item, index) => !history.has(getId(item, index)))
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
      onLoop?.() // New loop cycle started
    }
  })

  // Generate stack items with unified logic for loop and non-loop modes
  function generateStackItems(startIndex: number, limit: number, items: T[], loop: boolean, animatingIds: Set<string | number>): StackItem<T>[] {
    const result: StackItem<T>[] = []
    const len = items.length

    for (let i = 0; i < limit; i++) {
      const index = loop ? (startIndex + i + len) % len : startIndex + i

      // Break early for non-loop mode if we exceed array bounds
      if (!loop && index >= len)
        break

      const item = items[index]
      const itemId = getId(item, index)

      // Skip cards that are currently animating
      if (animatingIds.has(itemId))
        continue

      result.push({ item, itemId })
    }

    return result
  }

  // Stack generation for rendering (excluding animating cards)
  const stackList = computed(() => {
    const { renderLimit, items, loop = false } = options.value
    if (!items.length)
      return []

    const animatingIds = new Set(cardsInTransition.keys())
    return generateStackItems(currentIndex.value, renderLimit, items, loop, animatingIds)
  })

  // Is start is true if current index is 0
  const isStart = computed(() => expectedIndex.value === 0)

  // Is end is true if current index is greater or equal to items length
  const isEnd = computed(() => expectedIndex.value >= options.value.items.length)

  // Can restore is true if there is at least one completed card before current index
  // Also check animating card
  const canRestore = computed(() => {
    if (options.value.items.length <= 1 || isStart.value)
      return false

    const { items } = options.value

    for (let i = currentIndex.value - 1; i >= 0; i--) {
      const id = getId(items[i], i)
      if (history.has(id))
        return true
    }
    return false
  })

  // Helper function to add or replace card in transition
  function addOrReplaceCard(transitionCard: StackItem<T>) {
    cardsInTransition.set(transitionCard.itemId, transitionCard)
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
      animation: {
        type,
        isRestoring: false,
        initialPosition,
      },
    })

    // Always update history
    history.set(itemId, type)

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

    // Try reverse history iteration (last swiped first - good UX)
    for (const [itemId, action] of Array.from(history.entries()).reverse()) {
      if (isCardRestoring(itemId))
        continue

      // Find index of this item in current items array
      const item = items.find((item, idx) => getId(item, idx) === itemId)
      if (item) {
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
