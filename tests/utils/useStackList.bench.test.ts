import type { StackListOptions } from '../../src/utils/useStackList'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { SwipeAction } from '../../src/utils/useDragSetup'
import { useStackList } from '../../src/utils/useStackList'

/**
 * Benchmark reproducing the real-world business scenario:
 * - cards are loaded dynamically in batches (array only grows)
 * - history is never cleared (user keeps scrolling, doesn't prune seen cards)
 *
 * We measure how long a single swipe-cycle costs as the number of already-seen
 * cards grows. If currentIndex / generateStackItems scan from the start of the
 * array on every change, the per-swipe cost grows linearly with the scroll
 * position => O(n^2) over the session.
 */
describe('useStackList performance (growing deck, history not cleared)', () => {
  interface TestItem {
    id: number
    title: string
  }

  const makeItems = (count: number): TestItem[] =>
    Array.from({ length: count }, (_, i) => ({ id: i + 1, title: `Item ${i + 1}` }))

  // Measure average ms per swipe over a window of swipes starting at `from`
  function measureWindow(
    stackList: ReturnType<typeof useStackList<TestItem>>,
    from: number,
    window: number,
  ): number {
    const start = performance.now()
    for (let i = from; i < from + window; i++) {
      const id = i + 1
      stackList.swipeCard(id, SwipeAction.RIGHT)
      stackList.removeAnimatingCard(id)
      // touch the reactive getters the component reads each frame/update
      void stackList.currentIndex.value
      void stackList.stackList.value
      void stackList.canRestore.value
      void stackList.isEnd.value
    }
    return (performance.now() - start) / window
  }

  it('reports per-swipe cost as the deck grows', () => {
    const TOTAL = 8000
    const WINDOW = 500

    const options = ref<StackListOptions<TestItem>>({
      items: makeItems(TOTAL),
      loop: false,
      renderLimit: 3,
      itemKey: 'id',
    })
    const stackList = useStackList(options)

    // Warm up
    measureWindow(stackList, 0, WINDOW)

    const samples: { at: number, msPerSwipe: number }[] = []
    for (let from = 0; from + WINDOW <= TOTAL - WINDOW; from += WINDOW * 3) {
      samples.push({ at: from, msPerSwipe: measureWindow(stackList, from, WINDOW) })
    }

    // eslint-disable-next-line no-console
    console.log('\n  scroll position -> ms per swipe (finite mode)')
    for (const s of samples)
      // eslint-disable-next-line no-console
      console.log(`    @${String(s.at).padStart(5)}: ${s.msPerSwipe.toFixed(4)} ms`)

    const first = samples[0].msPerSwipe
    const last = samples[samples.length - 1].msPerSwipe
    // eslint-disable-next-line no-console
    console.log(`  degradation factor (last/first): ${(last / first).toFixed(1)}x\n`)

    // This assertion documents the current behaviour; flip the comparison
    // once the optimization lands to lock in the improvement.
    expect(samples.length).toBeGreaterThan(2)
  })

  it('reports per-swipe cost in loop mode (generateStackItems findIndex-in-loop)', () => {
    const TOTAL = 3000
    const WINDOW = 300

    const options = ref<StackListOptions<TestItem>>({
      items: makeItems(TOTAL),
      loop: false, // keep finite; loop clears history so it can't grow unbounded
      renderLimit: 5,
      itemKey: 'id',
    })
    const stackList = useStackList(options)

    measureWindow(stackList, 0, WINDOW)

    const early = measureWindow(stackList, WINDOW, WINDOW)
    const late = measureWindow(stackList, TOTAL - WINDOW * 2, WINDOW)

    // eslint-disable-next-line no-console
    console.log(`\n  renderLimit=5  early: ${early.toFixed(4)} ms  late: ${late.toFixed(4)} ms  (${(late / early).toFixed(1)}x)\n`)

    expect(late).toBeGreaterThan(0)
  })
})
