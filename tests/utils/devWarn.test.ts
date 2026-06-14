import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Dev-warning behaviour. `devWarn` keeps a module-level "already warned" set, so
 * each test re-imports it fresh via `vi.resetModules()` to get a clean slate.
 */
describe('devWarn', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('warns once per code, prefixed', async () => {
    vi.stubEnv('DEV', true)
    const { devWarn } = await import('../../src/utils/devWarn')

    devWarn('some-code', 'something is off')
    devWarn('some-code', 'something is off')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith('[vue3-flashcards] something is off')
  })

  it('warns separately for distinct codes', async () => {
    vi.stubEnv('DEV', true)
    const { devWarn } = await import('../../src/utils/devWarn')

    devWarn('code-a', 'a')
    devWarn('code-b', 'b')

    expect(warnSpy).toHaveBeenCalledTimes(2)
  })

  it('is silent outside dev', async () => {
    vi.stubEnv('DEV', false)
    const { devWarn } = await import('../../src/utils/devWarn')

    devWarn('any', 'should not show')

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
