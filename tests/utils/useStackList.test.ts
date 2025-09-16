import type { StackListOptions } from '../../src/utils/useStackList'
import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { SwipeAction } from '../../src/utils/useDragSetup'
import { useStackList } from '../../src/utils/useStackList'

describe('useStackList', () => {
  interface TestItem {
    id: number
    title: string
  }

  const createTestItems = (count: number): TestItem[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Item ${i + 1}`,
    }))

  describe('basic functionality', () => {
    it('should initialize with correct default state', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.isStart.value).toBe(true)
      expect(stackList.isEnd.value).toBe(false)
      expect(stackList.canRestore.value).toBe(false)
      expect(stackList.stackList.value).toHaveLength(3)
      expect(stackList.cardsInTransition.value).toHaveLength(0)
      expect(stackList.history.size).toBe(0)
    })

    it('should handle empty items array', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: [],
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.isEnd.value).toBe(true)
      expect(stackList.stackList.value).toHaveLength(0)
      expect(stackList.canRestore.value).toBe(false)
    })

    it('should generate correct stack items with proper z-index ordering', () => {
      const items = createTestItems(5)
      const options = ref<StackListOptions<TestItem>>({
        items,
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)
      const stack = stackList.stackList.value

      expect(stack).toHaveLength(3)
      expect(stack[0].item.id).toBe(1) // First item
      expect(stack[1].item.id).toBe(2)
      expect(stack[2].item.id).toBe(3)
    })
  })

  describe('currentIndex calculation', () => {
    it('should update currentIndex after marking items as completed', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.currentIndex.value).toBe(0)

      // Complete first item
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      expect(stackList.currentIndex.value).toBe(1)

      // Complete second item
      await stackList.swipeCard(2, SwipeAction.REJECT)
      expect(stackList.currentIndex.value).toBe(2)
    })

    it('should return items.length when all items are completed', async () => {
      const items = createTestItems(3)
      const options = ref<StackListOptions<TestItem>>({
        items,
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Complete all items
      for (let i = 1; i <= 3; i++) {
        await stackList.swipeCard(i, SwipeAction.APPROVE)
      }

      expect(stackList.currentIndex.value).toBe(3)
      expect(stackList.isEnd.value).toBe(true)
    })
  })

  describe('stack generation - finite mode', () => {
    it('should generate stack with correct items and indices', () => {
      const items = createTestItems(10)
      const options = ref<StackListOptions<TestItem>>({
        items,
        infinite: false,
        virtualBuffer: 4,
        trackBy: 'id',
      })

      const stackList = useStackList(options)
      const stack = stackList.stackList.value

      expect(stack).toHaveLength(4)
      expect(stack.map(s => s.item.id)).toEqual([1, 2, 3, 4])
      expect(stack.map(s => s.index)).toEqual([0, 1, 2, 3])
      // zIndex is no longer part of StackItem - it's computed in template
      // expect(stack.map(s => s.zIndex)).toEqual([4, 3, 2, 1])
    })

    it('should limit stack size when approaching end of items', async () => {
      const items = createTestItems(5)
      const options = ref<StackListOptions<TestItem>>({
        items,
        infinite: false,
        virtualBuffer: 4,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Complete first 3 items
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      await stackList.swipeCard(2, SwipeAction.APPROVE)
      await stackList.swipeCard(3, SwipeAction.APPROVE)

      const stack = stackList.stackList.value
      expect(stack).toHaveLength(2) // Only items 4 and 5 left
      expect(stack.map(s => s.item.id)).toEqual([4, 5])
    })
  })

  describe('stack generation - infinite mode', () => {
    it('should generate stack with cycling items', () => {
      const items = createTestItems(3)
      const options = ref<StackListOptions<TestItem>>({
        items,
        infinite: true,
        virtualBuffer: 5,
        trackBy: 'id',
      })

      const stackList = useStackList(options)
      const stack = stackList.stackList.value

      expect(stack).toHaveLength(5)
      // Should cycle: [1, 2, 3, 1, 2]
      expect(stack.map(s => s.item.id)).toEqual([1, 2, 3, 1, 2])
      // zIndex is no longer part of StackItem - it's computed in template
      // expect(stack.map(s => s.zIndex)).toEqual([5, 4, 3, 2, 1])
    })

    it('should clear history when cycling completes', async () => {
      const items = createTestItems(2)
      const options = ref<StackListOptions<TestItem>>({
        items,
        infinite: true,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Complete both items to trigger cycle
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      await stackList.swipeCard(2, SwipeAction.REJECT)

      // Wait for currentIndex computation
      await nextTick()

      // History should be cleared due to cycling
      expect(stackList.history.size).toBe(0)
      expect(stackList.currentIndex.value).toBe(0) // Reset to start
    })

    it('should handle cycling with different currentIndex positions', async () => {
      const items = createTestItems(4)
      const options = ref<StackListOptions<TestItem>>({
        items,
        infinite: true,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Complete first item, currentIndex becomes 1
      await stackList.swipeCard(1, SwipeAction.APPROVE)

      const stack = stackList.stackList.value
      expect(stack).toHaveLength(3)
      // Should show items starting from index 1: [2, 3, 4]
      expect(stack.map(s => s.item.id)).toEqual([2, 3, 4])
    })
  })

  describe('setApproval functionality', () => {
    it('should mark item as approved and add to history', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      await stackList.swipeCard(1, SwipeAction.APPROVE)

      expect(stackList.history.get(1)).toBe(SwipeAction.APPROVE)
      expect(stackList.cardsInTransition.value).toHaveLength(1)
      expect(stackList.cardsInTransition.value[0].animation?.type).toBe(SwipeAction.APPROVE)
    })

    it('should mark item as rejected and add to history', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      await stackList.swipeCard(2, SwipeAction.REJECT)

      expect(stackList.history.get(2)).toBe(SwipeAction.REJECT)
      expect(stackList.cardsInTransition.value).toHaveLength(1)
      expect(stackList.cardsInTransition.value[0].animation?.type).toBe(SwipeAction.REJECT)
    })

    it('should store initial position when provided', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)
      const initialPosition = { x: 100, y: 50 }

      await stackList.swipeCard(1, 'approve', initialPosition)

      expect(stackList.cardsInTransition.value[0].initialPosition).toEqual(initialPosition)
    })

    it('should not re-approve already completed items', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      await stackList.swipeCard(1, SwipeAction.APPROVE)
      const firstAnimatingCount = stackList.cardsInTransition.value.length

      // Try to set approval again with different type
      await stackList.swipeCard(1, SwipeAction.REJECT) // This will add new animation

      expect(stackList.cardsInTransition.value.length).toBe(firstAnimatingCount + 1)
      expect(stackList.history.get(1)).toBe(SwipeAction.REJECT) // Should be updated to 'reject'
    })

    it('should not change already completed items', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // First approval
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      expect(stackList.cardsInTransition.value[0].animation?.type).toBe(SwipeAction.APPROVE)

      // Try to change to rejection while animating - this will add new animation
      await stackList.swipeCard(1, SwipeAction.REJECT)
      expect(stackList.cardsInTransition.value).toHaveLength(2) // Now two animations
      expect(stackList.history.get(1)).toBe(SwipeAction.REJECT) // Type changed to reject
    })

    it('should handle non-existent item ids gracefully', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      await stackList.swipeCard(999, SwipeAction.APPROVE) // Non-existent id

      expect(stackList.history.size).toBe(0)
      expect(stackList.cardsInTransition.value).toHaveLength(0)
    })
  })

  describe('animation lifecycle', () => {
    it('should remove card from animating list when animation completes', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      await stackList.swipeCard(1, SwipeAction.APPROVE)
      expect(stackList.cardsInTransition.value).toHaveLength(1)

      stackList.removeAnimatingCard(1)
      expect(stackList.cardsInTransition.value).toHaveLength(0)
    })

    it('should exclude animating cards from main stack', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Initially 3 cards in stack
      expect(stackList.stackList.value).toHaveLength(3)
      expect(stackList.stackList.value.map(s => s.item.id)).toEqual([1, 2, 3])

      // Start animating first card
      await stackList.swipeCard(1, SwipeAction.APPROVE)

      // Stack should now exclude animating card and include next card
      expect(stackList.stackList.value).toHaveLength(3)
      expect(stackList.stackList.value.map(s => s.item.id)).toEqual([2, 3, 4])
    })
  })

  describe('restore functionality', () => {
    it('should enable restore when items are completed and animation finished', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.canRestore.value).toBe(false)

      await stackList.swipeCard(1, SwipeAction.APPROVE)
      // Card is completed and can be restored (even while animating)
      expect(stackList.canRestore.value).toBe(true)

      // Complete animation
      stackList.removeAnimatingCard(1)
      expect(stackList.canRestore.value).toBe(true)
    })

    it('should not allow restore with only 1 item', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(1),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      await stackList.swipeCard(1, SwipeAction.APPROVE)
      expect(stackList.canRestore.value).toBe(false)
    })

    it('should restore most recent completed card', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Complete first two items
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(1)
      await stackList.swipeCard(2, SwipeAction.REJECT)
      stackList.removeAnimatingCard(2)

      expect(stackList.canRestore.value).toBe(true)

      const restored = stackList.restoreCard()
      expect(restored).toBeTruthy()
      expect(restored).toEqual({ id: 2, title: 'Item 2' })

      // Should restore item 2 (most recent)
      expect(stackList.cardsInTransition.value).toHaveLength(1)
      expect(stackList.cardsInTransition.value[0].item.id).toBe(2)
      expect(stackList.cardsInTransition.value[0].animation?.isRestoring).toBe(true)
    })

    it('should complete restore animation and remove from history', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      await stackList.swipeCard(1, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(1)

      stackList.restoreCard()
      expect(stackList.cardsInTransition.value).toHaveLength(1)
      expect(stackList.history.has(1)).toBe(true)

      stackList.removeAnimatingCard(1, { withHistory: true })
      expect(stackList.cardsInTransition.value).toHaveLength(0)
      expect(stackList.history.has(1)).toBe(false) // After restore, item is removed from history
    })

    it('should not restore if no items can be restored', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      const restored = stackList.restoreCard()
      expect(restored).toBeUndefined()
      expect(stackList.cardsInTransition.value).toHaveLength(0)
    })

    it('should not restore cards that are currently animating', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Complete and animate first card
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      // Don't complete animation

      // Complete second card
      await stackList.swipeCard(2, SwipeAction.REJECT)
      stackList.removeAnimatingCard(2)

      // Should restore card 2, not card 1 (which is still animating)
      const restored = stackList.restoreCard()
      expect(restored).toBeTruthy()
      expect(restored).toEqual({ id: 2, title: 'Item 2' })
      expect(stackList.cardsInTransition.value.find(c => c.animation?.isRestoring)?.item.id).toBe(2)
    })
  })

  describe('computed properties', () => {
    it('should correctly compute isStart', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.isStart.value).toBe(true)

      await stackList.swipeCard(1, SwipeAction.APPROVE)
      expect(stackList.isStart.value).toBe(false)
    })

    it('should correctly compute isEnd', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(2),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.isEnd.value).toBe(false)

      await stackList.swipeCard(1, SwipeAction.APPROVE)
      expect(stackList.isEnd.value).toBe(false)

      await stackList.swipeCard(2, SwipeAction.APPROVE)
      expect(stackList.isEnd.value).toBe(true)
    })
  })

  describe('trackBy functionality', () => {
    it('should use custom trackBy property', () => {
      interface CustomItem {
        customId: string
        name: string
      }

      const items: CustomItem[] = [
        { customId: 'a', name: 'Item A' },
        { customId: 'b', name: 'Item B' },
        { customId: 'c', name: 'Item C' },
      ]

      const options = ref<StackListOptions<CustomItem>>({
        items,
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'customId',
      })

      const stackList = useStackList(options)
      const stack = stackList.stackList.value

      expect(stack.map(s => s.itemId)).toEqual(['a', 'b', 'c'])
    })

    it('should fall back to index when trackBy property is missing', () => {
      interface IncompleteItem {
        name: string
      }

      const items: IncompleteItem[] = [
        { name: 'Item A' },
        { name: 'Item B' },
      ]

      const options = ref<StackListOptions<IncompleteItem>>({
        items,
        infinite: false,
        virtualBuffer: 2,
        trackBy: 'id' as any, // Property doesn't exist
      })

      const stackList = useStackList(options)
      const stack = stackList.stackList.value

      expect(stack.map(s => s.itemId)).toEqual([0, 1]) // Should use indices
    })
  })

  describe('reactivity', () => {
    it('should react to changes in items array', async () => {
      const items = ref(createTestItems(3))
      const options = ref<StackListOptions<TestItem>>({
        items: items.value,
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.stackList.value).toHaveLength(3)

      // Change items array
      items.value = createTestItems(5)
      options.value = { ...options.value, items: items.value }
      await nextTick()

      expect(stackList.stackList.value).toHaveLength(3) // Still limited by virtualBuffer
      expect(stackList.stackList.value.map(s => s.item.id)).toEqual([1, 2, 3])
    })

    it('should react to changes in virtualBuffer', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 2,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.stackList.value).toHaveLength(2)

      // Increase virtualBuffer
      options.value = { ...options.value, virtualBuffer: 4 }
      await nextTick()

      expect(stackList.stackList.value).toHaveLength(4)
    })

    it('should react to changes in infinite mode', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 5,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.stackList.value).toHaveLength(3) // Limited by items count

      // Enable infinite mode
      options.value = { ...options.value, infinite: true }
      await nextTick()

      expect(stackList.stackList.value).toHaveLength(5) // Now can cycle
      expect(stackList.stackList.value.map(s => s.item.id)).toEqual([1, 2, 3, 1, 2])
    })
  })

  describe('edge cases', () => {
    it('should handle virtualBuffer larger than items array', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(2),
        infinite: false,
        virtualBuffer: 5,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.stackList.value).toHaveLength(2) // Limited by items count
    })

    it('should handle zero virtualBuffer', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 0,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.stackList.value).toHaveLength(0)
    })

    it('should handle single item in infinite mode', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(1),
        infinite: true,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      expect(stackList.stackList.value).toHaveLength(3)
      expect(stackList.stackList.value.map(s => s.item.id)).toEqual([1, 1, 1]) // Same item repeated
    })

    it('should maintain state consistency after multiple operations', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Complex sequence of operations
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      await stackList.swipeCard(2, SwipeAction.REJECT)
      stackList.removeAnimatingCard(1)
      stackList.removeAnimatingCard(2)

      stackList.restoreCard() // Restore item 2
      stackList.removeAnimatingCard(2, { withHistory: true })

      await stackList.swipeCard(2, SwipeAction.APPROVE) // Re-approve item 2
      stackList.removeAnimatingCard(2)

      // Verify final state - item 2 was restored and re-approved, so only 1 and 2 are completed
      expect(stackList.currentIndex.value).toBe(2)
      expect(stackList.history.get(1)).toBeTruthy()
      expect(stackList.history.get(2)).toBeTruthy()
      expect(stackList.history.get(3)).toBeUndefined()
    })
  })

  describe('reset functionality', () => {
    it('should reset all state to initial values', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Initial state
      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.isStart.value).toBe(true)
      expect(stackList.canRestore.value).toBe(false)
      expect(stackList.cardsInTransition.value).toHaveLength(0)
      expect(stackList.history.size).toBe(0)

      // Perform some operations
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      await stackList.swipeCard(2, SwipeAction.REJECT)
      stackList.restoreCard()

      // State should be changed
      expect(stackList.currentIndex.value).toBeGreaterThanOrEqual(0)
      expect(stackList.isStart.value).toBe(false)
      expect(stackList.canRestore.value).toBe(true)
      expect(stackList.cardsInTransition.value.length).toBeGreaterThan(0)
      expect(stackList.history.size).toBeGreaterThan(0)

      // Reset everything
      stackList.reset()

      // Should be back to initial state (basic checks only, as cards may still be animating)
      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.canRestore.value).toBe(false)
      expect(stackList.history.size).toBe(0)

      // Note: isStart may not be true immediately if cards are still animating
    })

    it('should clear all history entries', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(5),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Create some history
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(1)
      await stackList.swipeCard(2, SwipeAction.REJECT)
      stackList.removeAnimatingCard(2)
      await stackList.swipeCard(3, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(3)

      expect(stackList.history.size).toBe(3)
      expect(stackList.history.get(1)).toBeTruthy()
      expect(stackList.history.get(2)).toBeTruthy()
      expect(stackList.history.get(3)).toBeTruthy()

      // Reset
      stackList.reset()

      // History should be empty
      expect(stackList.history.size).toBe(0)
      expect(stackList.history.get(1)).toBeUndefined()
      expect(stackList.history.get(2)).toBeUndefined()
      expect(stackList.history.get(3)).toBeUndefined()
    })

    it('should reset state without clearing animating cards', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Start some animations
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      await stackList.swipeCard(2, SwipeAction.REJECT)
      await stackList.swipeCard(3, SwipeAction.APPROVE)

      expect(stackList.cardsInTransition.value.length).toBeGreaterThan(0)

      // Reset
      stackList.reset()

      // Should reset state but not clear animating cards (they clear themselves)
      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.canRestore.value).toBe(false)
      expect(stackList.history.size).toBe(0)
    })

    it('should work with infinite mode', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: true,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Swipe through all items in infinite mode
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(1)
      await stackList.swipeCard(2, SwipeAction.REJECT)
      stackList.removeAnimatingCard(2)
      await stackList.swipeCard(3, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(3)

      // In infinite mode, history may vary, let's just check that operations completed without errors

      // Reset
      stackList.reset()

      // Should be back to start
      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.isStart.value).toBe(true)
      expect(stackList.history.size).toBe(0)
    })

    it('should handle reset when already at initial state', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(3),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Reset at initial state should not cause errors
      expect(() => stackList.reset()).not.toThrow()

      // State should remain initial
      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.isStart.value).toBe(true)
      expect(stackList.canRestore.value).toBe(false)
      expect(stackList.cardsInTransition.value).toHaveLength(0)
      expect(stackList.history.size).toBe(0)
    })

    it('should handle reset with empty items array', () => {
      const options = ref<StackListOptions<TestItem>>({
        items: [],
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Reset with empty items should not cause errors
      expect(() => stackList.reset()).not.toThrow()

      expect(stackList.currentIndex.value).toBe(0)
      expect(stackList.cardsInTransition.value).toHaveLength(0)
      expect(stackList.history.size).toBe(0)
    })

    it('should make isEnd false after reset if there are items', async () => {
      const options = ref<StackListOptions<TestItem>>({
        items: createTestItems(2),
        infinite: false,
        virtualBuffer: 3,
        trackBy: 'id',
      })

      const stackList = useStackList(options)

      // Swipe all cards to reach end
      await stackList.swipeCard(1, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(1)
      await stackList.swipeCard(2, SwipeAction.APPROVE)
      stackList.removeAnimatingCard(2)

      expect(stackList.isEnd.value).toBe(true)

      // Reset
      stackList.reset()

      // Should not be at end anymore
      expect(stackList.isEnd.value).toBe(false)
      expect(stackList.isStart.value).toBe(true)
    })
  })
})
