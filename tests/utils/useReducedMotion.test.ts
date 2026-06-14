import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useReducedMotion } from '../../src/utils/useReducedMotion'

function withMatchMedia(matches: boolean, listeners: Array<(e: MediaQueryListEvent) => void> = []) {
  const mql = {
    matches,
    addEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mql))
  return { mql, listeners }
}

function mountWith() {
  let value: ReturnType<typeof useReducedMotion> | null = null
  const Comp = defineComponent({
    setup() {
      value = useReducedMotion()
      return () => h('div')
    },
  })
  const wrapper = mount(Comp)
  return {
    wrapper,
    get value() {
      return value!
    },
  }
}

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reflects the initial media query state', () => {
    withMatchMedia(true)
    const { value } = mountWith()
    expect(value.value).toBe(true)
  })

  it('is false when reduce is not preferred', () => {
    withMatchMedia(false)
    const { value } = mountWith()
    expect(value.value).toBe(false)
  })

  it('reacts to media query changes', async () => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = []
    withMatchMedia(false, listeners)
    const { value } = mountWith()
    expect(value.value).toBe(false)

    listeners.forEach(cb => cb({ matches: true } as MediaQueryListEvent))
    expect(value.value).toBe(true)
  })

  it('is SSR-safe (no matchMedia)', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { value } = mountWith()
    expect(value.value).toBe(false)
  })
})
