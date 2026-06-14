import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The dev-only "no itemKey + no id field" warning. Re-import per test so
 * `devWarn`'s once-per-session dedupe doesn't leak across cases.
 */
describe('useStackList dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  function warnedAboutKey() {
    return warnSpy.mock.calls.some(([msg]) => typeof msg === 'string' && msg.includes('itemKey'))
  }

  it('warns when no itemKey and items lack an id', async () => {
    const { useStackList } = await import('../../src/utils/useStackList')
    useStackList(() => ({
      items: [{ title: 'a' }, { title: 'b' }],
      renderLimit: 3,
    }))
    expect(warnedAboutKey()).toBe(true)
  })

  it('stays silent when items have an id', async () => {
    const { useStackList } = await import('../../src/utils/useStackList')
    useStackList(() => ({
      items: [{ id: 1, title: 'a' }, { id: 2, title: 'b' }],
      renderLimit: 3,
    }))
    expect(warnedAboutKey()).toBe(false)
  })

  it('stays silent when itemKey is provided', async () => {
    const { useStackList } = await import('../../src/utils/useStackList')
    useStackList(() => ({
      items: [{ uuid: 'a', title: 'a' }, { uuid: 'b', title: 'b' }],
      renderLimit: 3,
      itemKey: 'uuid',
    }))
    expect(warnedAboutKey()).toBe(false)
  })

  it('stays silent for an empty deck', async () => {
    const { useStackList } = await import('../../src/utils/useStackList')
    useStackList(() => ({
      items: [],
      renderLimit: 3,
    }))
    expect(warnedAboutKey()).toBe(false)
  })
})
