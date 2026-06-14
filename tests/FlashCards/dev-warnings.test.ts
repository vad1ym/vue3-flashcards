import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * FlashCards dev-only warnings: invalid `renderLimit` (silently clamped) and an
 * empty `swipeDirection` (card can't be swiped). Re-import FlashCards per test
 * so `devWarn`'s once-per-session dedupe doesn't leak across cases.
 */
describe('flashCards dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  function warnedAbout(needle: string) {
    return warnSpy.mock.calls.some(([msg]) => typeof msg === 'string' && msg.includes(needle))
  }

  const items = [{ id: 1, title: 'a' }, { id: 2, title: 'b' }]

  it('warns when renderLimit < 1', async () => {
    const { default: FlashCards } = await import('../../src/FlashCards.vue')
    mount(FlashCards, { props: { items, renderLimit: 0 } })
    expect(warnedAbout('renderLimit')).toBe(true)
  })

  it('stays silent for a valid renderLimit', async () => {
    const { default: FlashCards } = await import('../../src/FlashCards.vue')
    mount(FlashCards, { props: { items, renderLimit: 3 } })
    expect(warnedAbout('renderLimit')).toBe(false)
  })

  it('warns on an empty swipeDirection array', async () => {
    const { default: FlashCards } = await import('../../src/FlashCards.vue')
    mount(FlashCards, { props: { items, swipeDirection: [] } })
    expect(warnedAbout('swipeDirection')).toBe(true)
  })

  it('stays silent for a non-empty swipeDirection', async () => {
    const { default: FlashCards } = await import('../../src/FlashCards.vue')
    mount(FlashCards, { props: { items, swipeDirection: ['left'] } })
    expect(warnedAbout('swipeDirection')).toBe(false)
  })
})
