import type { MaybeRefOrGetter, Ref } from 'vue'
import type { DragPosition } from './useDragSetup'
import { computed, reactive, shallowRef, toRef, watch } from 'vue'
import { DragType } from './useDragSetup'

export interface CardState {
  type: 'approve' | 'reject'
  completed: boolean
}

export interface StackItem<T> {
  item: T
  index: number
  itemId: string | number
  zIndex: number
  animationType?: 'approve' | 'reject' | 'restore'
  state?: CardState
  initialPosition?: DragPosition
}

export interface StackListOptions<T> {
  items: T[]
  infinite: boolean
  virtualBuffer: number
  trackBy?: keyof T | 'id'
}

export function useStackList<T>(_options: MaybeRefOrGetter<StackListOptions<T>>) {
  const options = toRef(_options) as Ref<StackListOptions<T>>

  // Swiping history
  const history = reactive<Map<string | number, CardState>>(new Map())

  // Cards that are currently animating (using shallowRef for less re-renders)
  const cardsInTransition = shallowRef<StackItem<T>[]>([])

  // Generate ID for card
  function getId(item: T, index: number) {
    const trackKey = options.value.trackBy
    return trackKey && trackKey !== 'id'
      ? item[trackKey as keyof T]
      : (item as any).id ?? index
  }

  // Current index - first uncompleted card
  // It is the pointer for the first card in the stack, to detect current active card
  const currentIndex = computed(() => {
    const { items } = options.value
    const idx = items.findIndex((item, index) => !history.get(getId(item, index))?.completed)
    const result = idx === -1 ? items.length : idx
    return result
  })

  // Expected index after restoring animation, to better handle isStart & isEnd
  const expectedIndex = computed(() => {
    const restoreAnimations = cardsInTransition.value.filter(card => card.animationType === 'restore')
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
    const { virtualBuffer, items, infinite } = options.value
    const len = items.length
    if (!len)
      return []

    const result: StackItem<T>[] = []
    const animatingIds = new Set(cardsInTransition.value.map(card => card.itemId))

    if (infinite) {
      for (let i = 0; i < virtualBuffer; i++) {
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
          zIndex: virtualBuffer - i,
          state: history.get(itemId),
        })
      }
    }
    else {
      const endIndex = Math.min(currentIndex.value + virtualBuffer, len)
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
          zIndex: endIndex - i,
          state: history.get(itemId),
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
      if (history.get(id)?.completed)
        return true
    }
    return false
  })

  // Helper function to add or replace card in transition
  function addOrReplaceCard(newCard: StackItem<T>, replaceTypes: ('approve' | 'reject' | 'restore')[]) {
    const existingCardIndex = cardsInTransition.value.findIndex(c =>
      c.itemId === newCard.itemId && replaceTypes.includes(c.animationType!),
    )

    if (existingCardIndex !== -1) {
      cardsInTransition.value.splice(existingCardIndex, 1, newCard)
    }
    else {
      cardsInTransition.value.push(newCard)
    }

    // Trigger reactivity for shallowRef
    cardsInTransition.value = [...cardsInTransition.value]
  }

  // Remove animating card and optionally clear from history
  function removeAnimatingCard(itemId: string | number, options?: { withHistory?: boolean }) {
    cardsInTransition.value = cardsInTransition.value.filter(c => c.itemId !== itemId)

    if (options?.withHistory) {
      const existingState = history.get(itemId)
      if (existingState) {
        history.set(itemId, { ...existingState, completed: false })
      }
    }
  }

  // -------------------
  // Swiping functions
  // -------------------
  async function swipeCard(itemId: string | number, approved: boolean, initialPosition?: DragPosition) {
    const { items } = options.value

    const itemIndex = items.findIndex((item, index) => getId(item, index) === itemId)
    if (itemIndex === -1)
      return

    const state = {
      type: approved ? DragType.APPROVE : DragType.REJECT,
      completed: true,
    }

    addOrReplaceCard({
      item: items[itemIndex],
      index: itemIndex,
      itemId,
      animationType: state.type,
      state,
      zIndex: options.value.virtualBuffer + 1,
      initialPosition,
    }, ['restore'])

    // Always update history
    history.set(itemId, state)
  }

  // -------------------
  // Restore
  // -------------------
  function restoreCard(): boolean {
    if (!canRestore.value)
      return false

    const { items } = options.value

    // Simple index-based restore (LIFO order by index)
    for (let i = currentIndex.value - 1; i >= 0; i--) {
      const item = items[i]
      const itemId = getId(item, i)
      const state = history.get(itemId)

      if (state?.completed) {
        // Skip cards that are already restoring (to allow parallel restores of different cards)
        const isAlreadyRestoring = cardsInTransition.value.some(c =>
          c.itemId === itemId && c.animationType === 'restore',
        )

        if (!isAlreadyRestoring) {
          // Find card that's animating approve/reject to determine restore type
          const animatingCard = cardsInTransition.value.find(c =>
            c.itemId === itemId && ['approve', 'reject'].includes(c.animationType!),
          )
          const restoreFromType = animatingCard?.animationType || state?.type

          const newCard: StackItem<T> = {
            item,
            index: i,
            itemId,
            zIndex: options.value.virtualBuffer + 1,
            animationType: 'restore',
            state: { ...state, type: restoreFromType as 'approve' | 'reject' },
          }

          // Replace existing approve/reject animation or add new restore
          addOrReplaceCard(newCard, ['approve', 'reject'])
          return true
        }
      }
    }
    return false
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
  }
}
