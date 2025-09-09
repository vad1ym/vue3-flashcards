import type { DragPosition } from '../src/index'
import { describe, expect, it } from 'vitest'
import { FlashCards, FlipCard } from '../src/index'

describe('index exports', () => {
  it('should export FlashCards component', () => {
    expect(FlashCards).toBeDefined()
    expect(typeof FlashCards).toBe('object')
  })

  it('should export FlipCard component', () => {
    expect(FlipCard).toBeDefined()
    expect(typeof FlipCard).toBe('object')
  })

  it('should export DragPosition type', () => {
    // Test that the type can be used
    const position: DragPosition = { x: 0, y: 0, delta: 0, type: null }
    expect(position.x).toBe(0)
    expect(position.y).toBe(0)
    expect(position.delta).toBe(0)
    expect(position.type).toBe(null)
  })
})
