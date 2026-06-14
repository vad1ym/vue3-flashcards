import type { MaybeRefOrGetter } from 'vue'
import type { DragPosition, SwipeAction } from './useDragSetup'
import { computed, reactive, ref, toValue, watch } from 'vue'

/**
 * Lifecycle of a single card, modelled as an explicit state machine.
 *
 * A card is never simply "in the deck" or "gone" — the swipe/restore gestures
 * are animated, so a card spends time in transient states where it's visually
 * moving but not yet logically committed. Modelling this as an explicit state
 * machine (rather than an ad-hoc mix of a history map + a transition map + an
 * `isRestoring` flag) is what makes the tricky gestures correct and readable:
 *
 *   pending ──swipe──▶ swiping ──animationEnd──▶ swiped
 *      ▲                  │                         │
 *      │              restore                   restore
 *      │                  ▼                         ▼
 *      └──animationEnd── restoring ◀───────────────┘
 *                         │
 *                  swipe (restore→next): restoring ──▶ swiping
 *
 * Where each state lives (see the two structures inside the composable):
 * - `pending`   : no record anywhere — absence IS the pending state.
 * - `swiping`   : a `records` entry. Animating off-screen, NOT yet committed.
 *                 A restore can still catch it (fast swipe → restore).
 * - `restoring` : a `records` entry. Animating back in; counts as not-active so
 *                 the active card does NOT jump (restore isn't "active" until
 *                 its animation finishes). A new swipe overwrites it, so
 *                 restore → fast next just cancels the restore.
 * - `swiped`    : a `history` entry (NOT in `records`). Committed and consumed.
 *
 * Splitting swiped (history) from in-flight (records) keeps `records` tiny —
 * bounded by overlapping animations, never by deck size — so its iterations
 * stay cheap as the deck grows.
 */
export type CardState = 'swiping' | 'restoring'

export interface CardRecord {
  state: CardState
  action: SwipeAction // swipe direction / type
  initialPosition?: DragPosition
}

export interface StackItem<T> {
  item: T
  itemId: string | number
  stackIndex: number // Current position in stack (0 = top)
  isAnimating?: boolean
  // The in-flight animation descriptor for this card (a "flight"). Internal
  // wiring only: FlashCard consumes it to drive its WAAPI fly-out/restore. NOT
  // the public `animation` config prop (keyframes/duration/easing).
  flight?: {
    type: SwipeAction
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

  // -------------------------------------------------------------------------
  // Card lifecycle, split across two structures for performance — but driven by
  // ONE explicit state machine (see CardState docs):
  //
  //   records : only IN-FLIGHT cards (`swiping` / `restoring`). Always small
  //             (bounded by how many animations overlap), so every iteration
  //             over it is cheap regardless of deck size.
  //   history : committed (`swiped`) cards. Grows with the deck, but is only
  //             ever touched by O(1) get/has/set/delete — never iterated on the
  //             hot path.
  //
  // A card's state is the union: in `records` => its record.state; else in
  // `history` => `swiped`; else `pending`. The transition functions keep the
  // two in lock-step so this union is always consistent.
  // -------------------------------------------------------------------------
  const records = reactive(new Map<string | number, CardRecord>())
  const history = reactive(new Map<string | number, SwipeAction>())

  // True while any card is animating (swiping out or restoring back in).
  const hasCardsInTransition = computed(() => records.size > 0)

  // Generate ID for card
  function getId(item: T, index: number): string | number {
    if (!item)
      return index

    const trackKey = options.value.itemKey || 'id'
    return item[trackKey as keyof T] as string | number ?? index
  }

  /**
   * Map of itemId -> index in the source array. Rebuilt only when `items`
   * actually changes, turning the scattered `findIndex` scans into O(1) lookups.
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
   * A card is "consumed" (no longer the active card) when it's committed
   * (`swiped`, in history) or animating away (`swiping`). A `restoring` card is
   * NOT consumed, but it sits behind the cursor so the forward scan skips it.
   * O(1): two map lookups.
   */
  function isConsumed(itemId: string | number): boolean {
    return history.has(itemId) || records.get(itemId)?.state === 'swiping'
  }

  // -------------------------------------------------------------------------
  // Active-card cursor (O(1) amortized lookups). `cursorId` is a forward-scan
  // start hint, moved explicitly on swipe/restore/reset/loop. Resilient to
  // runtime mutations of `items`: cards inserted before the cursor never steal
  // focus (we only scan forward); a removed cursor card restarts from 0.
  // -------------------------------------------------------------------------
  const cursorId = ref<string | number | null>(null)

  function resolveActiveIndex(startIndex: number): number {
    const { items } = options.value
    for (let i = Math.max(0, startIndex); i < items.length; i++) {
      if (!isConsumed(getId(items[i], i)))
        return i
    }
    return items.length
  }

  // Position of the active card (first non-consumed), or items.length at end.
  const currentIndex = computed(() => {
    const hintIdx = cursorId.value === null ? 0 : indexOfId(cursorId.value)
    return resolveActiveIndex(hintIdx === -1 ? 0 : hintIdx)
  })

  // ID of the active card (a real id, or the number items.length at end-of-deck
  // — unchanged public activeItemKey contract).
  const currentItemId = computed<string | number>(() => {
    const { items } = options.value
    return getId(items[currentIndex.value], currentIndex.value)
  })

  // Advance the cursor hint to the active card after a transition.
  function syncCursor() {
    const { items } = options.value
    const idx = currentIndex.value
    cursorId.value = idx < items.length ? getId(items[idx], idx) : null
  }

  // -------------------------------------------------------------------------
  // Derived view preserving the original public shape: `cardsInTransition`
  // looks like the old list of animating StackItems. (`history` is the Map
  // declared above — consumers read history.get/has/size directly.)
  //
  // IMPORTANT: StackItem objects (and their nested `flight` object) must keep
  // a STABLE identity for as long as the underlying record is unchanged.
  // FlashCard.vue watches `flight` by reference to drive its WAAPI animation
  // and treats a new reference as "animation replaced" (cancel + re-run) — so
  // rebuilding these objects on every recompute would falsely restart in-flight
  // animations when a sibling card starts animating (e.g. fast swipe → fast
  // restore). We cache by itemId and only rebuild when the record's meaningful
  // fields change.
  // -------------------------------------------------------------------------
  const stackItemCache = new Map<string | number, { rec: CardRecord, stackItem: StackItem<T> }>()

  function getTransitionStackItem(itemId: string | number, rec: CardRecord): StackItem<T> {
    const cached = stackItemCache.get(itemId)
    if (
      cached
      && cached.rec.state === rec.state
      && cached.rec.action === rec.action
      && cached.rec.initialPosition === rec.initialPosition
    ) {
      return cached.stackItem
    }

    const idx = indexOfId(itemId)
    const stackItem: StackItem<T> = {
      item: options.value.items[idx] as T,
      itemId,
      stackIndex: 0,
      isAnimating: true,
      flight: {
        type: rec.action,
        isRestoring: rec.state === 'restoring',
        initialPosition: rec.initialPosition,
      },
    }
    stackItemCache.set(itemId, { rec, stackItem })
    return stackItem
  }

  // Cards currently animating in the DOM. `records` holds ONLY in-flight cards
  // (swiping/restoring), so this is bounded by overlapping animations, not deck
  // size.
  const transitionList = computed<StackItem<T>[]>(() => {
    const result: StackItem<T>[] = []
    for (const [id, rec] of records) {
      if (indexOfId(id) !== -1)
        result.push(getTransitionStackItem(id, rec))
    }
    // Drop cache entries for cards that left transition, so they rebuild fresh
    // if they animate again later.
    if (stackItemCache.size > records.size) {
      for (const id of stackItemCache.keys()) {
        if (!records.has(id))
          stackItemCache.delete(id)
      }
    }
    return result
  })

  // Number of cards currently restoring (used to look ahead for isStart/isEnd).
  const restoringCount = computed(() => {
    let n = 0
    for (const rec of records.values()) {
      if (rec.state === 'restoring')
        n++
    }
    return n
  })

  // Expected index once in-flight restores settle — keeps isStart/isEnd stable.
  const expectedIndex = computed(() => currentIndex.value - restoringCount.value)

  // -------------------------------------------------------------------------
  // Loop mode: on a completed cycle, clear committed cards and rewind.
  // -------------------------------------------------------------------------
  watch(expectedIndex, (ci) => {
    const { loop, items, onLoop } = options.value
    if (loop && ci === items.length) {
      // Drop all committed cards; leave in-flight animations to finish naturally.
      history.clear()
      cursorId.value = null
      onLoop?.()
    }
  })

  // -------------------------------------------------------------------------
  // Stack generation (animating cards first, then the forward window).
  // -------------------------------------------------------------------------
  function generateStackItems(startIndex: number, limit: number, items: T[], loop: boolean): StackItem<T>[] {
    const result: StackItem<T>[] = []
    const len = items.length
    const animatingAdded = new Set<string | number>()

    // Animating cards (swiping/restoring) render on top.
    for (const card of transitionList.value) {
      result.push(card)
      animatingAdded.add(card.itemId)
    }

    // Then the regular forward window.
    for (let i = 0; i < limit; i++) {
      const index = loop ? (startIndex + i + len) % len : startIndex + i
      if (!loop && index >= len)
        break

      const item = items[index]
      const itemId = getId(item, index)

      if (!animatingAdded.has(itemId)) {
        result.push({ item, itemId, stackIndex: i, isAnimating: false })
      }
    }

    return result
  }

  const stackList = computed(() => {
    const { renderLimit, items, loop = false } = options.value
    if (!items.length)
      return []

    return generateStackItems(currentIndex.value, renderLimit, items, loop)
  })

  const isStart = computed(() => expectedIndex.value === 0)
  const isEnd = computed(() => expectedIndex.value >= options.value.items.length)

  /**
   * Can restore if there's a committed-or-swiping card before the active one.
   * (A `swiping` card counts — fast swipe → restore must be able to catch it.)
   */
  const canRestore = computed(() => {
    if (options.value.items.length <= 1 || expectedIndex.value === 0)
      return false

    const { items } = options.value
    for (let i = expectedIndex.value - 1; i >= 0; i--) {
      const id = getId(items[i], i)
      // committed (history) or still swiping away — both are restorable.
      if (history.has(id) || records.get(id)?.state === 'swiping')
        return true
    }
    return false
  })

  // -------------------------------------------------------------------------
  // Transitions
  // -------------------------------------------------------------------------

  /**
   * swipe: pending/swiped/restoring ──▶ swiping
   * Overwriting an existing record is intentional: restore → fast next lands
   * here and simply cancels the in-flight restore by switching it to swiping.
   */
  function swipeCard(itemId: string | number, type: SwipeAction, initialPosition?: DragPosition): T | undefined {
    const { items, waitAnimationEnd } = options.value

    // Block new actions while something animates, if requested.
    if (hasCardsInTransition.value && waitAnimationEnd)
      return

    const idx = indexOfId(itemId)
    if (idx === -1)
      return
    const item = items[idx]

    // Card is now in-flight again; it lives in `records`, not `history`
    // (covers restore → fast next: a restoring card that was still committed).
    records.set(itemId, { state: 'swiping', action: type, initialPosition })
    history.delete(itemId)
    // The swiped card is now consumed; advance the cursor.
    syncCursor()

    return item
  }

  /**
   * Swipe whatever card is "active" for a button-triggered action.
   *
   * Normally that's the current card. But if a restore is mid-animation, the
   * intent of pressing next/swipe is to act on the card being restored (restore
   * → fast next cancels the restore and sends it back out). This encapsulates
   * that target-selection so consumers don't need to know about the state
   * machine — they just call swipeActive(type).
   */
  function swipeActive(type: SwipeAction): T | undefined {
    // A restoring card takes priority as the action target. With several cards
    // restoring at once (e.g. two fast restores), the target is the TOPMOST card
    // the user sees — the one with the highest z-index.
    //
    // z-index of animating cards follows `records` INSERTION order (see the
    // stack template: animating cards render in `transitionList` / `records`
    // order, later ones on top). Restores run back-to-front (descending array
    // index), so the LAST-inserted restoring record — the last one iterated, NOT
    // the highest array index — is the one on top. Picking by array index would
    // swipe the card UNDERNEATH the one the user is looking at.
    let target: string | number | undefined
    for (const [id, rec] of records) {
      if (rec.state === 'restoring')
        target = id // keep overwriting → ends on the last (topmost) one
    }
    if (target !== undefined)
      return swipeCard(target, type)
    // Otherwise act on the current active card, if it's not already animating.
    const id = currentItemId.value
    if (indexOfId(id) !== -1 && !records.has(id))
      return swipeCard(id, type)
    return undefined
  }

  /**
   * restore: finds the most recent committed (`swiped`) or in-flight (`swiping`)
   * card before the active one and moves it to `restoring`. The active card does
   * NOT change yet — the restored card only becomes active when its animation
   * finishes (so restore → fast next can cancel it cleanly).
   */
  function restoreCard(): T | undefined {
    if (!canRestore.value)
      return

    const { items } = options.value
    // Search backward from the active card for something to restore.
    for (let i = expectedIndex.value - 1; i >= 0; i--) {
      const itemId = getId(items[i], i)
      const rec = records.get(itemId)

      if (rec?.state === 'restoring')
        continue // already on its way back

      // The action is whatever it was swiped as — from the in-flight record if
      // it's still swiping, otherwise from committed history.
      const action = rec?.state === 'swiping' ? rec.action : history.get(itemId)
      if (action) {
        records.set(itemId, { state: 'restoring', action, initialPosition: rec?.initialPosition })
        return items[i]
      }
    }

    return undefined
  }

  /**
   * animationEnd: resolve a transient state to its committed form.
   *   swiping   ──▶ swiped   (commit; in loop mode only if it belongs to cycle)
   *   restoring ──▶ pending  (delete record; card returns to the deck)
   */
  function removeAnimatingCard(itemId: string | number) {
    const rec = records.get(itemId)
    if (!rec)
      return

    if (rec.state === 'restoring') {
      records.delete(itemId)
      history.delete(itemId)
      // Restored card sits behind the cursor; point the cursor at it directly.
      moveCursorTo(itemId)
    }
    else if (rec.state === 'swiping') {
      const { loop } = options.value
      if (loop) {
        // Only commit if the card belongs to the current cycle (before active).
        const cardIndex = indexOfId(itemId)
        if (cardIndex !== -1 && cardIndex < currentIndex.value)
          commit(itemId, rec)
        else
          records.delete(itemId)
      }
      else {
        commit(itemId, rec)
      }
      syncCursor()
    }
  }

  // swiping ──▶ swiped: drop the in-flight record, commit to history.
  function commit(itemId: string | number, rec: CardRecord) {
    records.delete(itemId)
    history.set(itemId, rec.action)
  }

  function moveCursorTo(itemId: string | number) {
    cursorId.value = itemId
  }

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  async function reset(resetOptions?: ResetOptions) {
    if (resetOptions?.animate) {
      // Cascade: restore committed cards one by one for a fanning effect.
      const committed = [...history.keys()]
      for (let i = 0; i < committed.length; i++) {
        if (restoreCard())
          await new Promise(resolve => setTimeout(resolve, resetOptions?.delay ?? 90))
      }
      // Records clear themselves as restore animations finish.
    }
    else {
      records.clear()
      history.clear()
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
    swipeActive,
    restoreCard,
    removeAnimatingCard,
    reset,
    hasCardsInTransition,
    currentItemId,
    cardsInTransition: transitionList,
  }
}
