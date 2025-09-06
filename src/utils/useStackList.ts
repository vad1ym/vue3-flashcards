import type { MaybeRefOrGetter } from 'vue'
import { computed, reactive, ref, toRef } from 'vue'
import { DragType } from './useDragSetup'

export interface CardState {
  completed?: boolean
  type?: DragType
}

export interface StackListOptions<T> {
  items: T[]
  infinite: boolean
  virtualBuffer: number
}

export function useStackList<T>(_options: MaybeRefOrGetter<StackListOptions<T>>) {
  const options = toRef(_options)

  const history = reactive<Map<number, CardState>>(new Map())
  const currentIndex = ref(0)

  /**
   * Returns item based on virtual index (for infinite mode)
   * Returns item based on index (for finite mode)
   */
  function getItemAtIndex(index: number): T {
    const { infinite, items } = options.value

    if (infinite) {
      return items[index % items.length] as T
    }
    return items[index] as T
  }

  // Indicates the start of the finite cards
  const isStart = computed(() => currentIndex.value === 0)

  // Indicates the end of finite cards
  const isEnd = computed(() => currentIndex.value >= options.value.items.length)

  // Indicates the ability to restore the previous card
  const canRestore = computed(() => !isStart.value)

  /**
   * Returns the visible items based on the current index and virtual buffer
   * Is used for virtualization
   */
  const visibleItems = computed(() => {
    const { infinite, virtualBuffer, items } = options.value

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
   * Set the card as approved or rejected
   */
  function setApproval(index: number, approved: boolean) {
    history.set(index, {
      type: approved ? DragType.APPROVE : DragType.REJECT,
      completed: true,
    })
    currentIndex.value++

    return getItemAtIndex(index)
  }

  /**
   * Find the previous card, reset and restore it
   */
  function restoreCard() {
    if (isStart.value)
      return false

    const previousIndex = currentIndex.value - 1
    const previousCardState = history.get(previousIndex)

    if (previousCardState) {
      previousCardState.completed = false
      currentIndex.value = previousIndex
      return true
    }

    return false
  }

  return {
    history,
    currentIndex,
    isStart,
    isEnd,
    canRestore,
    visibleItems,
    getItemAtIndex,
    setApproval,
    restoreCard,
  }
}
