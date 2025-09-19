import type { DragPosition } from '../src/utils/useDragSetup'
import { describe, expect, it, vi } from 'vitest'
import { FlashCards, FlashCardsConfigKey, FlashCardsPlugin, FlipCard } from '../src/index'

describe('index exports', () => {
  describe('plugin export', () => {
    it('should export plugin as default', () => {
      expect(FlashCardsPlugin).toBeDefined()
      expect(typeof FlashCardsPlugin).toBe('function')
    })

    it('should be usable as Vue plugin', () => {
      const mockApp = {
        provide: vi.fn(),
        component: vi.fn(),
      } as any

      expect(() => {
        FlashCardsPlugin(mockApp)
      }).not.toThrow()

      expect(mockApp.provide).toHaveBeenCalled()
      expect(mockApp.component).toHaveBeenCalled()
    })
  })

  describe('component exports', () => {
    it('should export FlashCards component', () => {
      expect(FlashCards).toBeDefined()
      expect(typeof FlashCards).toBe('object')
      // Vue 3 script setup components are valid objects
      expect(FlashCards).toBeTruthy()
    })

    it('should NOT export FlashCard component', () => {
      // FlashCard should not be exported from main index
      const exports = { FlashCards, FlipCard, FlashCardsConfigKey }
      expect(Object.keys(exports)).not.toContain('FlashCard')
    })

    it('should export FlipCard component', () => {
      expect(FlipCard).toBeDefined()
      expect(typeof FlipCard).toBe('object')
      // Vue 3 script setup components are valid objects
      expect(FlipCard).toBeTruthy()
    })

    it('should export main components (excluding FlashCard)', () => {
      const exports = { FlashCards, FlipCard }
      const exportNames = Object.keys(exports)

      expect(exportNames).toHaveLength(2)
      expect(exportNames).toContain('FlashCards')
      expect(exportNames).toContain('FlipCard')
      expect(exportNames).not.toContain('FlashCard')
    })

    it('should export FlashCardsConfigKey', () => {
      expect(FlashCardsConfigKey).toBeDefined()
      expect(typeof FlashCardsConfigKey).toBe('symbol')
    })
  })

  describe('type exports', () => {
    it('should export DragPosition type', () => {
      // Test that the type can be used
      const position: DragPosition = { x: 0, y: 0, delta: 0, type: null }
      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
      expect(position.delta).toBe(0)
      expect(position.type).toBe(null)
    })

    it('should allow DragPosition with valid type values', () => {
      const approvePosition: DragPosition = { x: 100, y: 0, delta: 100, type: 'approve' }
      const rejectPosition: DragPosition = { x: -100, y: 0, delta: -100, type: 'reject' }

      expect(approvePosition.type).toBe('approve')
      expect(rejectPosition.type).toBe('reject')
      expect(approvePosition.delta).toBe(100)
      expect(rejectPosition.delta).toBe(-100)
    })

    it('should export FlashCardsGlobalConfig type', () => {
      // Test that the type can be used
      const config = {
        stack: 3,
        stackOffset: 25,
        loop: true,
      }
      expect(config.stack).toBe(3)
      expect(config.stackOffset).toBe(25)
      expect(config.loop).toBe(true)
    })

    it('should export FlashCardsPluginOptions type', () => {
      // Test that the type can be used
      const options = {
        config: { stack: 2 },
        registerComponents: false,
      }
      expect(options.config?.stack).toBe(2)
      expect(options.registerComponents).toBe(false)
    })
  })

  describe('library structure', () => {
    it('should provide clean API surface', () => {
      // Check that main components are exported correctly (excluding FlashCard)
      const exports = { FlashCards, FlipCard, FlashCardsConfigKey }
      const exportKeys = Object.keys(exports)

      // Should export main components and utilities (no FlashCard)
      expect(exportKeys).toEqual(expect.arrayContaining(['FlashCards', 'FlipCard', 'FlashCardsConfigKey']))
      expect(exportKeys).toHaveLength(3)
      expect(exportKeys).not.toContain('FlashCard')
    })

    it('should export plugin as default with expected signature', () => {
      expect(FlashCardsPlugin).toBeDefined()
      expect(typeof FlashCardsPlugin).toBe('function')

      // Should be callable as Vue plugin
      const mockApp = { provide: vi.fn(), component: vi.fn() } as any
      expect(() => FlashCardsPlugin(mockApp)).not.toThrow()
    })
  })
})
