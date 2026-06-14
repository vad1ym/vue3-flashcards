import type { StackListOptions } from '../../src/utils/useStackList'
import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { SwipeAction } from '../../src/utils/useDragSetup'
import { useStackList } from '../../src/utils/useStackList'

/**
 * Property / invariant tests for useStackList.
 *
 * These lock in the CURRENT correct behaviour before the currentIndex -> id-cursor
 * refactor. The whole point of the refactor is to survive runtime mutations of the
 * source `items` array (dynamic loading, insertion, removal, reorder) while keeping
 * the active-card pointer resilient. So we hammer exactly those scenarios here.
 *
 * Core invariant (what makes the pointer resilient):
 *   currentItemId === id of the FIRST item in `items` that is neither in history
 *   nor currently animating (non-restoring).
 */
describe('useStackList invariants', () => {
  interface TestItem {
    id: number
    title: string
  }

  const item = (id: number): TestItem => ({ id, title: `Item ${id}` })
  const makeItems = (count: number, offset = 0): TestItem[] =>
    Array.from({ length: count }, (_, i) => item(i + 1 + offset))

  function setItems(options: ReturnType<typeof ref<StackListOptions<TestItem>>>, items: TestItem[]) {
    options.value = { ...options.value!, items }
  }

  function isConsumed(
    id: string | number,
    history: Map<string | number, string>,
    transition: { itemId: string | number, animation?: { isRestoring: boolean } }[],
  ): boolean {
    if (history.has(id))
      return true
    const card = transition.find(c => c.itemId === id)
    return !!card && !card.animation?.isRestoring
  }

  /**
   * Structural invariants that hold regardless of the cursor's exact landing
   * spot. These pin down correctness (no consumed/missing active card, no
   * duplicate or stale stack entries) for the randomized sweep, where the
   * precise A-vs-B id depends on cursor history we don't replicate here.
   *
   * The exact "follow-the-card" (A) id is asserted in the explicit tests below,
   * where the sequence is known.
   */
  function assertCoreInvariants(
    stackList: ReturnType<typeof useStackList<TestItem>>,
    items: TestItem[],
    renderLimit: number,
    loop = false,
  ) {
    const stack = stackList.stackList.value
    const history = stackList.history as Map<string | number, string>
    const transition = stackList.cardsInTransition.value
    const currentIndex = stackList.currentIndex.value

    // 1. stackList itemIds are unique (no card rendered twice in finite mode)
    if (!loop) {
      const ids = stack.map(s => s.itemId)
      expect(new Set(ids).size).toBe(ids.length)
    }

    // 2. stackList never exceeds renderLimit + cards in transition
    expect(stack.length).toBeLessThanOrEqual(renderLimit + transition.length)

    // End-of-deck is signalled by currentIndex === items.length. (Note: the
    // currentItemId VALUE at end-of-deck is the number items.length, which can
    // collide with a real numeric id, so we must key off currentIndex here.)
    const atEnd = currentIndex === items.length

    // 3. If not at end, the active card is a real, present, non-consumed card.
    if (!atEnd) {
      expect(currentIndex).toBeGreaterThanOrEqual(0)
      expect(currentIndex).toBeLessThan(items.length)
      const activeCard = items[currentIndex]
      expect(activeCard).toBeDefined()
      expect(isConsumed(activeCard.id, history, transition)).toBe(false)
    }

    // 4. If at end, every present card must be consumed (nothing left to show).
    if (atEnd) {
      for (const it of items)
        expect(isConsumed(it.id, history, transition)).toBe(true)
    }
  }

  describe('resilience to runtime mutations', () => {
    it('keeps the pointer on the same card when items are inserted BEFORE current', async () => {
      const items = makeItems(5) // ids 1..5
      const options = ref<StackListOptions<TestItem>>({ items, loop: false, renderLimit: 3, itemKey: 'id' })
      const stackList = useStackList(options)

      // Advance to card id=3
      stackList.swipeCard(1, SwipeAction.RIGHT)
      stackList.removeAnimatingCard(1)
      stackList.swipeCard(2, SwipeAction.LEFT)
      stackList.removeAnimatingCard(2)
      expect(stackList.currentItemId.value).toBe(3)

      // Insert two brand new cards at the very front (ids 100, 101)
      const mutated = [item(100), item(101), ...items]
      setItems(options, mutated)
      await nextTick()

      // The active card MUST still be id=3 (pointer follows the card, not the index)
      expect(stackList.currentItemId.value).toBe(3)
      assertCoreInvariants(stackList, mutated, 3)
    })

    it('recomputes the pointer when the current card is REMOVED', async () => {
      const items = makeItems(5)
      const options = ref<StackListOptions<TestItem>>({ items, loop: false, renderLimit: 3, itemKey: 'id' })
      const stackList = useStackList(options)

      stackList.swipeCard(1, SwipeAction.RIGHT)
      stackList.removeAnimatingCard(1)
      expect(stackList.currentItemId.value).toBe(2)

      // Remove the current card (id=2) from the source array
      const mutated = items.filter(it => it.id !== 2)
      setItems(options, mutated)
      await nextTick()

      // Pointer moves to the next surviving uncompleted card (id=3)
      expect(stackList.currentItemId.value).toBe(3)
      assertCoreInvariants(stackList, mutated, 3)
    })

    it('does not resurrect or lose history when items are reordered', async () => {
      const items = makeItems(6)
      const options = ref<StackListOptions<TestItem>>({ items, loop: false, renderLimit: 3, itemKey: 'id' })
      const stackList = useStackList(options)

      // Complete ids 1 and 2
      stackList.swipeCard(1, SwipeAction.RIGHT)
      stackList.removeAnimatingCard(1)
      stackList.swipeCard(2, SwipeAction.LEFT)
      stackList.removeAnimatingCard(2)

      // Before reorder: cursor sits on id=3 (first uncompleted)
      expect(stackList.currentItemId.value).toBe(3)

      // Reorder remaining cards (and move completed ones around too).
      // Note id=4 is now placed BEFORE id=3.
      const mutated = [item(4), item(2), item(6), item(1), item(3), item(5)]
      setItems(options, mutated)
      await nextTick()

      // History is keyed by id, so completed cards stay completed regardless of order
      expect(stackList.history.has(1)).toBe(true)
      expect(stackList.history.has(2)).toBe(true)

      // Behaviour A (follow-the-card): the active card stays id=3 — the card the
      // user was on — even though the reorder put uncompleted id=4 before it.
      // The card under the finger never jumps.
      expect(stackList.currentItemId.value).toBe(3)
      assertCoreInvariants(stackList, mutated, 3)
    })

    it('handles appended batches (dynamic loading) without disturbing position', async () => {
      const items = makeItems(3)
      const options = ref<StackListOptions<TestItem>>({ items, loop: false, renderLimit: 3, itemKey: 'id' })
      const stackList = useStackList(options)

      stackList.swipeCard(1, SwipeAction.RIGHT)
      stackList.removeAnimatingCard(1)
      stackList.swipeCard(2, SwipeAction.RIGHT)
      stackList.removeAnimatingCard(2)
      expect(stackList.currentItemId.value).toBe(3)
      expect(stackList.isEnd.value).toBe(false)

      // Load next batch appended to the end
      const mutated = [...items, ...makeItems(5, 3)] // adds ids 4..8
      setItems(options, mutated)
      await nextTick()

      // Still on id=3, and now there are more cards after it
      expect(stackList.currentItemId.value).toBe(3)
      expect(stackList.isEnd.value).toBe(false)
      assertCoreInvariants(stackList, mutated, 3)
    })
  })

  describe('randomized property sweep', () => {
    // Deterministic PRNG so failures reproduce (no Math.random — also banned in this env)
    function mulberry32(seed: number) {
      return () => {
        seed |= 0
        seed = (seed + 0x6D2B79F5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    it('maintains core invariants across random swipe/restore/mutate sequences', async () => {
      for (let seed = 1; seed <= 20; seed++) {
        const rand = mulberry32(seed)
        let nextId = 1
        const grow = (n: number) => Array.from({ length: n }, () => item(nextId++))

        let items = grow(8)
        const options = ref<StackListOptions<TestItem>>({ items, loop: false, renderLimit: 3, itemKey: 'id' })
        const stackList = useStackList(options)

        for (let step = 0; step < 40; step++) {
          const roll = rand()

          if (roll < 0.45) {
            // swipe current
            const id = stackList.currentItemId.value
            if (typeof id === 'number' && items.some(it => it.id === id)) {
              stackList.swipeCard(id, rand() < 0.5 ? SwipeAction.RIGHT : SwipeAction.LEFT)
              stackList.removeAnimatingCard(id)
            }
          }
          else if (roll < 0.6) {
            // restore
            if (stackList.canRestore.value) {
              const restored = stackList.restoreCard()
              if (restored)
                stackList.removeAnimatingCard(restored.id)
            }
          }
          else if (roll < 0.75) {
            // append a batch (dynamic loading)
            items = [...items, ...grow(1 + Math.floor(rand() * 4))]
            setItems(options, items)
          }
          else if (roll < 0.85) {
            // insert before current
            const pos = Math.floor(rand() * items.length)
            items = [...items.slice(0, pos), ...grow(1), ...items.slice(pos)]
            setItems(options, items)
          }
          else if (roll < 0.92 && items.length > 2) {
            // remove a random not-yet-active card
            const pos = Math.floor(rand() * items.length)
            items = items.filter((_, i) => i !== pos)
            setItems(options, items)
          }
          else {
            // reorder a small swap
            if (items.length > 3) {
              const a = Math.floor(rand() * items.length)
              const b = Math.floor(rand() * items.length)
              items = [...items]
              ;[items[a], items[b]] = [items[b], items[a]]
              setItems(options, items)
            }
          }

          await nextTick()
          assertCoreInvariants(stackList, items, 3)
        }
      }
    })
  })

  describe('loop cycle integrity', () => {
    it('clears history at cycle boundary and never renders previous-cycle history', async () => {
      const items = makeItems(3)
      const options = ref<StackListOptions<TestItem>>({ items, loop: true, renderLimit: 3, itemKey: 'id' })
      const stackList = useStackList(options)

      for (let cycle = 0; cycle < 3; cycle++) {
        for (let id = 1; id <= 3; id++) {
          stackList.swipeCard(id, SwipeAction.RIGHT)
          stackList.removeAnimatingCard(id)
          await nextTick()
        }
        await nextTick()
        // After a full cycle, history must be empty so the next cycle starts fresh
        expect(stackList.history.size).toBe(0)
        expect(stackList.currentItemId.value).toBe(1)
      }
    })
  })
})
