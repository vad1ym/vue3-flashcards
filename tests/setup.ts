// Test setup file
import { beforeEach } from 'vitest'

// Fix TextEncoder issue for esbuild in Node.js environment
if (typeof globalThis.TextEncoder === 'undefined') {
  // eslint-disable-next-line ts/no-require-imports
  const { TextEncoder, TextDecoder } = require('node:util')
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}

// Ensure Uint8Array constructor is properly available
if (typeof globalThis.Uint8Array === 'undefined') {
  globalThis.Uint8Array = Uint8Array
}

// Only set up DOM-related polyfills if we're in a DOM environment
if (typeof document !== 'undefined') {
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
}
