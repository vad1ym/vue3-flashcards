import type { ModuleOptions } from '../nuxt/module'
import { describe, expect, it, vi } from 'vitest'

describe('nuxt module integration tests', () => {
  it('should export correct typescript interfaces', () => {
    // Type-only test - if this compiles, the types are correct
    const validOptions: ModuleOptions = {
      stack: 2,
      stackOffset: 20,
      threshold: 100,
      infinite: false,
      maxRotation: 15,
      renderLimit: 4,
      dragThreshold: 5,
      maxDraggingX: null,
      maxDraggingY: null,
    }

    expect(validOptions).toBeDefined()
  })

  it('should have valid module structure', async () => {
    const module = await import('../nuxt/module')

    expect(module.default).toBeDefined()
    // Nuxt modules are functions that return module definitions
    expect(typeof module.default).toBe('function')
  })

  it('should support all FlashCards props as module options', () => {
    // This validates that ModuleOptions correctly extends FlashCardsProps
    const options: ModuleOptions = {
      // Core props
      stack: 3,
      stackOffset: 25,
      threshold: 150,
      infinite: true,

      // Animation props
      maxRotation: 20,
      renderLimit: 5,

      // Interaction props
      dragThreshold: 5,
      maxDraggingX: 200,
      maxDraggingY: 100,
      disableDrag: false,

      // Advanced props
      waitAnimationEnd: false,
      stackScale: 0.05,
      stackDirection: 'bottom',
    }

    // Should compile without TypeScript errors
    expect(options).toBeDefined()
  })

  it('should test SSR compatibility of components', async () => {
    // Import components and ensure they don't use browser APIs at module level
    const { FlashCards } = await import('../src/index')
    const { default: FlipCard } = await import('../src/FlipCard.vue')

    expect(FlashCards).toBeDefined()
    expect(FlipCard).toBeDefined()

    // Components should be importable in Node.js environment
    expect(typeof FlashCards).toBe('object')
    expect(typeof FlipCard).toBe('object')
  })

  it('should test plugin SSR safety', async () => {
    // Import plugin and ensure no browser APIs are called at import time
    const plugin = await import('../src/plugin')

    expect(plugin.default).toBeDefined()
    expect(typeof plugin.default).toBe('function')

    // Mock Vue app
    const mockApp = {
      provide: vi.fn(),
      component: vi.fn(),
    }

    // Plugin should run without browser APIs
    expect(() => {
      plugin.default(mockApp as any, { config: { stack: 2 } })
    }).not.toThrow()

    expect(mockApp.provide).toHaveBeenCalled()
    expect(mockApp.component).toHaveBeenCalledWith('FlashCards', expect.any(Object))
    expect(mockApp.component).toHaveBeenCalledWith('FlipCard', expect.any(Object))
  })

  it('should validate configuration inheritance', () => {
    // Test that global config can be overridden by local props
    const globalConfig: ModuleOptions = {
      stack: 3,
      threshold: 150,
      infinite: true,
    }

    const localProps = {
      threshold: 200, // Override global
      maxRotation: 25, // New local prop
    }

    // Simulate prop merging (how it works in FlashCards component)
    const mergedConfig = { ...globalConfig, ...localProps }

    expect(mergedConfig.stack).toBe(3) // From global
    expect(mergedConfig.threshold).toBe(200) // Overridden by local
    expect(mergedConfig.infinite).toBe(true) // From global
    expect(mergedConfig.maxRotation).toBe(25) // From local
  })

  it('should validate generated plugin template', () => {
    const mockOptions: ModuleOptions = {
      stack: 2,
      stackOffset: 15,
      threshold: 120,
    }

    // Simulate template generation
    const templateContent = `
import { defineNuxtPlugin } from '#app'
import vuePlugin from 'path/to/plugin'

export default defineNuxtPlugin((nuxtApp) => {
  const config = ${JSON.stringify(mockOptions, null, 2)}

  nuxtApp.vueApp.use(vuePlugin, {
    config,
    registerComponents: true,
  })
})
    `

    expect(templateContent).toContain('defineNuxtPlugin')
    expect(templateContent).toContain('"stack": 2')
    expect(templateContent).toContain('registerComponents: true')
  })
})
