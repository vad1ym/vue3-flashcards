/**
 * Dev-only `console.warn`. Stripped from production builds: every call site is
 * guarded by `import.meta.env.DEV`, so the whole branch (and this module) is
 * tree-shaken out when bundled by a consumer's Vite/Rollup setup.
 *
 * Each unique `code` warns at most once per session, so a warning tied to a
 * reactive recompute (e.g. an invalid `renderLimit`) doesn't spam the console
 * on every render.
 */
const warned = new Set<string>()

export function devWarn(code: string, message: string): void {
  if (!import.meta.env.DEV)
    return
  if (warned.has(code))
    return
  warned.add(code)
  console.warn(`[vue3-flashcards] ${message}`)
}
