import type { MaybeRefOrGetter } from 'vue'
import type { DragPosition } from './useDragSetup'
import { computed, reactive, shallowRef, toValue, watch } from 'vue'

export interface StackItem<T> {
  item: T
  index: number
  itemId: string | number
  animation?: {
    type: string
    isRestoring: boolean
    initialPosition?: DragPosition
  }
}

export interface StackListOptions<T> {
  items: T[]
  infinite?: boolean
  renderLimit: number
  itemKey?: keyof T | 'id'
  waitAnimationEnd?: boolean
}

export interface ResetOptions {
  animate?: boolean
  delay?: number
}

export function useStackList<T>(_options: MaybeRefOrGetter<StackListOptions<T>>) {
  const options = computed(() => toValue(_options))

  // Swiping history
  const history = reactive<Map<string | number, string>>(new Map())

  // Cards that are currently animating (using shallowRef for less re-renders)
  const cardsInTransition = shallowRef<StackItem<T>[]>([])
  const hasCardsInTransition = computed(() => cardsInTransition.value.length > 0)

  // Generate ID for card
  function getId(item: T, index: number) {
    const trackKey = options.value.itemKey
    return trackKey && trackKey !== 'id'
      ? item[trackKey as keyof T]
      : (item as any).id ?? index
  }

  // Current index - first uncompleted card
  // It is the pointer for the first card in the stack, to detect current active card
  const currentIndex = computed(() => {
    const { items } = options.value
    const idx = items.findIndex((item, index) => !history.has(getId(item, index)))
    const result = idx === -1 ? items.length : idx
    return result
  })

  // Expected index after restoring animation, to better handle isStart & isEnd
  const expectedIndex = computed(() => {
    const restoreAnimations = cardsInTransition.value.filter(card =>
      card.animation?.isRestoring,
    )
    return currentIndex.value - restoreAnimations.length
  })

  // For infinite mode reset history on new cycle (when index points outside of source array)
  watch(currentIndex, (ci) => {
    const { infinite, items } = options.value
    if (infinite && ci === items.length) {
      history.clear()
    }
  })

  // Stack generation for rendering (excluding animating cards)
  const stackList = computed(() => {
    const { renderLimit, items, infinite } = options.value
    const len = items.length
    if (!len)
      return []

    const result: StackItem<T>[] = []
    const animatingIds = new Set(cardsInTransition.value.map(card => card.itemId))

    if (infinite) {
      for (let i = 0; i < renderLimit; i++) {
        const index = (currentIndex.value + i + len) % len
        const item = items[index]
        const itemId = getId(item, index)

        // Skip cards that are currently animating
        if (animatingIds.has(itemId))
          continue

        result.push({
          item,
          index,
          itemId,
        })
      }
    }
    else {
      const endIndex = Math.min(currentIndex.value + renderLimit, len)
      for (let i = currentIndex.value; i < endIndex; i++) {
        const item = items[i]
        const itemId = getId(item, i)

        // Skip cards that are currently animating
        if (animatingIds.has(itemId))
          continue

        result.push({
          item,
          index: i,
          itemId,
        })
      }
    }

    return result
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
    // Try find oposite animation (approve/reject or restore)
    const existingCardIndex = cardsInTransition.value.findIndex(c =>
      c.itemId === transitionCard.itemId
      && c.animation?.isRestoring === !transitionCard.animation?.isRestoring,
    )

    // If has oposite animation, replace it
    if (existingCardIndex !== -1) {
      cardsInTransition.value.splice(existingCardIndex, 1, transitionCard)
    }
    // Otherwise add new
    else {
      cardsInTransition.value.push(transitionCard)
    }

    // Trigger reactivity for shallowRef
    cardsInTransition.value = [...cardsInTransition.value]
  }

  // Remove animating card and optionally clear from history
  function removeAnimatingCard(itemId: string | number) {
    const card = cardsInTransition.value.find(c => c.itemId === itemId)
    if (!card)
      return

    // If card was restored - remove card from history
    if (card.animation?.isRestoring) {
      history.delete(itemId)
    }

    // Remove card from transitions (faster filter for performance)
    cardsInTransition.value = cardsInTransition.value.filter(c => c.itemId !== itemId)
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
    const itemIndex = items.findIndex((item, index) => getId(item, index) === itemId)
    if (itemIndex === -1) {
      return
    }

    // action parameter is already StackAction, no conversion needed

    const item = items[itemIndex]

    addOrReplaceCard({
      item,
      index: itemIndex,
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
  // Restore
  // -------------------
  function restoreCard(): T | undefined {
    if (!canRestore.value) {
      return
    }

    const { items, waitAnimationEnd } = options.value

    // If some cards is in animation and waitAnimationEnd is true, prevent action
    if (hasCardsInTransition.value && waitAnimationEnd) {
      return
    }

    // Simple index-based restore (LIFO order by index)
    for (let i = currentIndex.value - 1; i >= 0; i--) {
      const item = items[i]
      const itemId = getId(item, i)
      const action = history.get(itemId)

      if (action) {
        // Skip cards that are already restoring (to allow parallel restores of different cards)
        const isAlreadyRestoring = cardsInTransition.value.some(c =>
          c.itemId === itemId && c.animation?.isRestoring,
        )

        if (!isAlreadyRestoring) {
          // Find card that's animating approve/reject to determine restore type
          const animatingCard = cardsInTransition.value.find(c =>
            c.itemId === itemId && c.animation && !c.animation.isRestoring,
          )
          const restoreFromType = animatingCard?.animation?.type || action

          // Replace existing approve/reject animation or add new restore
          addOrReplaceCard({
            item,
            index: i,
            itemId,
            animation: {
              type: restoreFromType,
              isRestoring: true,
            },
          })
          return item
        }
      }
    }
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
      cardsInTransition.value = []
    }
  }

  return {
    history,
    currentIndex,
    isStart,
    isEnd,
    canRestore,
    stackList,
    cardsInTransition,
    swipeCard,
    restoreCard,
    removeAnimatingCard,
    reset,
  }
}
