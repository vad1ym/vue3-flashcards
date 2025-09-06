// Test setup file
import { beforeEach } from 'vitest'

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

beforeEach(() => {
  // Reset DOM between tests
  document.body.innerHTML = ''
})
