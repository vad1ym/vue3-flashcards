import type { Ref } from 'vue'
import { onScopeDispose, ref } from 'vue'

/**
 * Reactive `prefers-reduced-motion` flag.
 *
 * `true` when the user (OS-level) has asked for reduced motion. The library uses
 * it to collapse fly-out / restore animation durations to ~0 and to skip the
 * decorative skip "wave" shimmer, so the deck still works — cards just snap into
 * place instead of sliding. SSR-safe: returns `false` until the client hydrates.
 */
export function useReducedMotion(): Ref<boolean> {
  const prefers = ref(false)

  if (typeof window === 'undefined' || !window.matchMedia)
    return prefers

  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefers.value = query.matches

  const onChange = (e: MediaQueryListEvent) => {
    prefers.value = e.matches
  }

  // `addEventListener` is the modern API; older Safari only has `addListener`.
  if (query.addEventListener)
    query.addEventListener('change', onChange)
  else
    query.addListener(onChange)

  onScopeDispose(() => {
    if (query.removeEventListener)
      query.removeEventListener('change', onChange)
    else
      query.removeListener(onChange)
  })

  return prefers
}
