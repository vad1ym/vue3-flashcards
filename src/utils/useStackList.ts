import type { MaybeRefOrGetter } from 'vue'
import type { DragPosition } from './useDragSetup'
import { computed, reactive, ref, shallowReactive, toValue, watch } from 'vue'

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

  /**
   * Map of itemId -> index in the source array.
   * Rebuilt only when `items` actually changes (reference/length/content),
   * NOT on every swipe. This turns the repeated `items.findIndex(...)` calls
   * scattered across this composable into O(1) lookups, removing the
   * O(renderLimit * n) work in generateStackItems and the linear scans in
   * removeAnimatingCard / findRestorableCard.
   */
  const idToIndex = computed(() => {
    const { items } = options.value
    const map = new Map<string | number, number>()
    for (let i = 0; i < items.length; i++)
      map.set(getId(items[i], i), i)
    return map
  })

  function indexOfId(itemId: string | number): number {
    return idToIndex.value.get(itemId) ?? -1
  }

  /**
   * Is this card "consumed" for the purpose of finding the active card?
   * A card is consumed if it's in history or currently swiping away (not restoring).
   */
  function isConsumed(itemId: string | number): boolean {
    if (history.has(itemId))
      return true
    const card = cardsInTransition.get(itemId)
    return !!card && !card.animation?.isRestoring
  }

  /**
   * CURSOR (id-based active pointer).
   *
   * Instead of re-scanning the whole array from index 0 on every change
   * (which is O(scroll-position) per swipe => O(n^2) over a session when
   * history is never cleared), we keep the active card as an id and advance
   * it forward incrementally.
   *
   * The cursor is resilient to runtime mutations of `items`:
   * - cards inserted BEFORE the cursor do NOT steal focus (we follow the card,
   *   not the index) — the user's current card stays put under their finger;
   * - cards appended after the cursor don't disturb it;
   * - if the cursor card is removed from `items`, we recompute from its last
   *   known position.
   *
   * It stores the id of a card at or before the active card, used purely as a
   * scan start hint. `null` = "scan from the beginning".
   */
  const cursorId = ref<string | number | null>(null)

  /**
   * Scan forward from `startIndex`, returning the index of the first
   * non-consumed card, or items.length if none remain. Forward-only; the start
   * hint lets us skip the already-consumed prefix instead of re-walking it.
   */
  function resolveActiveIndex(startIndex: number): number {
    const { items } = options.value
    for (let i = Math.max(0, startIndex); i < items.length; i++) {
      if (!isConsumed(getId(items[i], i)))
        return i
    }
    return items.length
  }

  /**
   * Current index — position of the active card (first non-consumed) in the
   * source array, or items.length at end-of-deck.
   *
   * The cursor (`cursorId`) is a start hint moved explicitly by swipe / restore
   * / reset. On the happy path the scan starts right at the active card and
   * returns immediately (amortized O(1) per swipe). The hint is resilient to
   * runtime mutations: if its card was removed we restart from 0; cards
   * inserted before it never steal focus because we only ever scan FORWARD
   * from the hint, never re-evaluate the consumed prefix.
   */
  const currentIndex = computed(() => {
    const hintIdx = cursorId.value === null ? 0 : indexOfId(cursorId.value)
    return resolveActiveIndex(hintIdx === -1 ? 0 : hintIdx)
  })

  // ID of the current card — derived from currentIndex exactly as the original
  // implementation did, so the public activeItemKey contract is unchanged
  // (a real id, or the number items.length at end-of-deck).
  const currentItemId = computed<string | number>(() => {
    const { items } = options.value
    return getId(items[currentIndex.value], currentIndex.value)
  })

  /**
   * Advance the cursor hint to the current active card after a swipe, so the
   * next scan skips the just-consumed card instead of re-walking the prefix.
   */
  function syncCursor() {
    const { items } = options.value
    const idx = currentIndex.value
    cursorId.value = idx < items.length ? getId(items[idx], idx) : null
  }

  /**
   * Point the cursor hint at a specific card (used by restore, which moves the
   * active card BACKWARD to the just-restored item).
   */
  function moveCursorTo(itemId: string | number) {
    cursorId.value = itemId
  }

  // Expected index after restoring animation, to better handle isStart & isEnd
  const expectedIndex = computed(() => {
    const restoreCount = Array.from(cardsInTransition.values()).filter(card =>
      card.animation?.isRestoring,
    ).length
    return currentIndex.value - restoreCount
  })

  // For loop mode reset history on new cycle (when index points outside of source array)
  watch(expectedIndex, (ci) => {
    const { loop, items, onLoop } = options.value
    if (loop && ci === items.length) {
      history.clear()
      // New cycle: reset the cursor so the active card resolves to the first item.
      cursorId.value = null
      // Don't clear cardsInTransition here - let animations finish naturally
      // But we need to prevent restore from finding cards from previous cycle
      // And also we need to prevent last animating cards to appear in next cycle history
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
      const originalIndex = indexOfId(itemId)
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
      // Restore completed: the restored card becomes the active one again.
      // It sits BEHIND the cursor, which the forward-only resolver can't reach,
      // so point the cursor at it explicitly (then syncCursor below is a no-op
      // since the card is now the first non-consumed one).
      moveCursorTo(itemId)
    }
    else if (card.animation) {
      // Card finished swiping animation - add to history only if we're still in the same cycle
      const { loop } = options.value
      if (loop) {
        // In loop mode, check if card belongs to current cycle
        const cardIndex = indexOfId(itemId)
        // Only add to history if card index is before current index (belongs to current cycle)
        if (cardIndex !== -1 && cardIndex < currentIndex.value) {
          history.set(itemId, card.animation.type)
        }
      }
      else {
        // In non-loop mode, always add to history
        history.set(itemId, card.animation.type)
      }
    }

    // Remove card from transitions
    cardsInTransition.delete(itemId)

    // The just-finished card is now consumed (history) or freed (restore);
    // pull the cursor to the new active card so the next resolve is O(1).
    syncCursor()
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
    const idx = indexOfId(itemId)
    if (idx === -1) {
      return
    }
    const item = items[idx]

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

    // The swiped card is now consumed (animating away); advance the cursor to
    // the next active card so subsequent lookups stay O(1).
    syncCursor()

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
      // Reset the cursor so the active card resolves back to the first item.
      cursorId.value = null
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
