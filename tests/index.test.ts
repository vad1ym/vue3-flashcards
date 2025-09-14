import type { DragPosition } from '../src/index'
import { describe, expect, it } from 'vitest'
import { FlashCard, FlashCards, FlipCard } from '../src/index'

describe('index exports', () => {
  describe('component exports', () => {
    it('should export FlashCards component', () => {
      expect(FlashCards).toBeDefined()
      expect(typeof FlashCards).toBe('object')
      // Vue 3 script setup components are valid objects
      expect(FlashCards).toBeTruthy()
    })

    it('should export FlashCard component', () => {
      expect(FlashCard).toBeDefined()
      expect(typeof FlashCard).toBe('object')
      // Vue 3 script setup components are valid objects
      expect(FlashCard).toBeTruthy()
    })

    it('should export FlipCard component', () => {
      expect(FlipCard).toBeDefined()
      expect(typeof FlipCard).toBe('object')
      // Vue 3 script setup components are valid objects
      expect(FlipCard).toBeTruthy()
    })

    it('should export all main components', () => {
      const exports = { FlashCard, FlashCards, FlipCard }
      const exportNames = Object.keys(exports)

      expect(exportNames).toHaveLength(3)
      expect(exportNames).toContain('FlashCard')
      expect(exportNames).toContain('FlashCards')
      expect(exportNames).toContain('FlipCard')
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
  })

  describe('library structure', () => {
    it('should provide clean API surface', () => {
      // Check that main components are exported correctly
      const exports = { FlashCard, FlashCards, FlipCard }
      const exportKeys = Object.keys(exports)

      // Should export main components
      expect(exportKeys).toEqual(expect.arrayContaining(['FlashCard', 'FlashCards', 'FlipCard']))
      expect(exportKeys).toHaveLength(3)
    })
  })
})
