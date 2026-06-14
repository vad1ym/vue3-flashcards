// Test setup file
import { beforeEach } from 'vitest'

// Fix TextEncoder issue for esbuild in Node.js environment
if (typeof globalThis.TextEncoder === 'undefined') {
  // eslint-disable-next-line ts/no-require-imports
  const { TextEncoder, TextDecoder } = require('node:util')
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}

// Ensure Uint8Array constructor is properly available
if (typeof globalThis.Uint8Array === 'undefined') {
  globalThis.Uint8Array = Uint8Array
}

// Only set up DOM-related polyfills if we're in a DOM environment
if (typeof document !== 'undefined') {
  // Polyfill PointerEvent for JSDOM
  globalThis.PointerEvent = class extends MouseEvent {
    constructor(type: string, options: any = {}) {
      super(type, options)
      this.pointerId = options.pointerId || 1
      this.pointerType = options.pointerType || 'mouse'
    }

    pointerId: number
    pointerType: string
  } as any

  // Polyfill Element.animate (Web Animations API) for JSDOM, which doesn't
  // implement it. FlashCard drives fly-out / restore via `el.animate(...)` and
  // emits `animationend` from `.finished`.
  //
  // The fake deliberately leaves `.finished` PENDING and only resolves it on an
  // explicit `.finish()` (or rejects on `.cancel()`), mirroring the old ghost
  // system whose `animationend` event never fired under JSDOM. Tests assert
  // state DURING the in-flight animation (e.g. activeItemKey stays put while a
  // restore animates), so animations must not auto-complete.
  if (typeof Element !== 'undefined' && typeof Element.prototype.animate !== 'function') {
    // Track running animations per element so the `getAnimations` polyfill below
    // can return them (real DOM keeps this list internally).
    const runningAnims = new WeakMap<Element, Set<any>>()

    Element.prototype.animate = function (this: Element, _keyframes: any, _options: any) {
      let resolveFinished!: (value: any) => void
      let rejectFinished!: (reason: any) => void
      const set = runningAnims.get(this) ?? new Set()
      runningAnims.set(this, set)
      const anim: any = {
        finished: new Promise((resolve, reject) => {
          resolveFinished = resolve
          rejectFinished = reject
        }),
        cancel() {
          set.delete(anim)
          // Match the spec: cancelling rejects `.finished` with an AbortError.
          const err = new Error('The user aborted a request.')
          err.name = 'AbortError'
          rejectFinished(err)
        },
        finish() {
          set.delete(anim)
          resolveFinished(anim)
        },
        play() {},
        pause() {},
      }
      set.add(anim)
      // Swallow the rejection so an un-awaited cancel doesn't warn.
      anim.finished.catch(() => {})
      return anim
    } as any

    // Polyfill `Element.getAnimations`: returns the still-running fake animations
    // created via the `animate` polyfill above. FlashCard uses it to clear a
    // lingering swipe-out fill when a card is reused as a loop background card.
    if (typeof Element.prototype.getAnimations !== 'function') {
      Element.prototype.getAnimations = function (this: Element) {
        return [...(runningAnims.get(this) ?? [])]
      } as any
    }
  }

  beforeEach(() => {
    // Reset DOM between tests
    document.body.innerHTML = ''
  })
}
