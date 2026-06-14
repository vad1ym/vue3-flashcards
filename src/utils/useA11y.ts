import type { MaybeRefOrGetter } from 'vue'
import type { A11yLabels } from '../config/flashcards.config'
import type { Direction, SwipeAction } from './useDragSetup'
import { computed, ref, toValue } from 'vue'
import { a11yDefaults } from '../config/flashcards.config'

/**
 * Public, user-facing accessibility options (the grouped `a11y` prop).
 *
 * Accessibility is ON by default — every field here is optional and falls back
 * to {@link a11yDefaults}. Pass `a11y: false` (or `{ enabled: false }`) to opt
 * out of all built-in a11y wiring and supply your own.
 */
export interface A11yOptions {
  /** Master switch. `false` disables roles, live region, keyboard and focus. */
  enabled?: boolean
  /** Arrow / Enter / Space / restore keyboard navigation. Default `true`. */
  keyboard?: boolean
  /**
   * Two-step keyboard swipe: an arrow key peeks the card to its full pre-swipe
   * pose and waits for Enter/Space to confirm (Escape cancels). Default `false`
   * — arrow keys swipe immediately.
   */
  confirmOnKey?: boolean
  /** Move focus to the next card after a keyboard swipe. Default `true`. */
  manageFocus?: boolean
  /** aria-live politeness of the announcement region. Default `'polite'`. */
  liveMode?: 'polite' | 'assertive'
  /** Override any of the built-in English labels for localization. */
  labels?: Partial<A11yLabels>
  /**
   * Build the live-region announcement for a deck event. Return `null`/`''` to
   * stay silent. Defaults to e.g. `"Card swiped right, 4 remaining"`.
   */
  announce?: (event: A11yAnnounceEvent) => string | null
}

/** The kind of event being announced to assistive technology. */
export type A11yAnnounceEventType = 'swipe' | 'restore' | 'empty'

export interface A11yAnnounceEvent {
  type: A11yAnnounceEventType
  /** For a swipe, the direction / skip action that occurred. */
  action?: SwipeAction
  /** Cards left in the deck after this event. */
  remaining: number
  /** Resolved labels (already merged with user overrides). */
  labels: A11yLabels
}

/** The `a11y` prop accepts the options object, or a plain boolean shorthand. */
export type A11yProp = A11yOptions | boolean

export function useA11y(getOptions: MaybeRefOrGetter<A11yProp | undefined>) {
  const options = computed<A11yOptions>(() => {
    const raw = toValue(getOptions)
    if (raw === undefined)
      return {}
    if (typeof raw === 'boolean')
      return { enabled: raw }
    return raw
  })

  const enabled = computed(() => options.value.enabled ?? a11yDefaults.enabled)
  const keyboard = computed(() => enabled.value && (options.value.keyboard ?? a11yDefaults.keyboard))
  const confirmOnKey = computed(() => options.value.confirmOnKey ?? a11yDefaults.confirmOnKey)
  const manageFocus = computed(() => enabled.value && (options.value.manageFocus ?? a11yDefaults.manageFocus))
  const liveMode = computed(() => options.value.liveMode ?? a11yDefaults.liveMode)

  const labels = computed<A11yLabels>(() => ({
    ...a11yDefaults.labels,
    ...options.value.labels,
  }))

  // The text currently held in the visually-hidden aria-live region.
  const announcement = ref('')

  function defaultAnnounce(event: A11yAnnounceEvent): string {
    const { type, action, remaining, labels } = event
    const remainingText = `${remaining} remaining`

    if (type === 'empty')
      return labels.empty
    if (type === 'restore')
      return `${labels.card} ${labels.restore}, ${remainingText}`

    // swipe
    const dirLabel = action ? (labels as Record<string, string>)[action] ?? action : ''
    return `${labels.card} ${dirLabel}, ${remainingText}`
  }

  function announce(type: A11yAnnounceEventType, remaining: number, action?: SwipeAction) {
    if (!enabled.value)
      return

    const event: A11yAnnounceEvent = { type, action, remaining, labels: labels.value }
    const text = options.value.announce ? options.value.announce(event) : defaultAnnounce(event)
    if (!text)
      return

    // Re-assigning the same string would not re-trigger some screen readers, so
    // clear first then set on the next tick-equivalent.
    announcement.value = ''
    // microtask is enough for the DOM to register the empty→text change.
    Promise.resolve().then(() => {
      announcement.value = text
    })
  }

  /** Human-readable label for the active card (aria-label). */
  function cardLabel(index: number, total: number): string {
    return `${labels.value.card} ${index + 1} ${total ? `of ${total}` : ''}`.trim()
  }

  return {
    enabled,
    keyboard,
    confirmOnKey,
    manageFocus,
    liveMode,
    labels,
    announcement,
    announce,
    cardLabel,
  }
}

/** Map a keyboard event to the swipe direction it requests, if any. */
export function directionForKey(key: string, enabledDirections: Direction[]): Direction | null {
  const map: Record<string, Direction> = {
    ArrowUp: 'top',
    ArrowDown: 'bottom',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }
  const dir = map[key]
  return dir && enabledDirections.includes(dir) ? dir : null
}
