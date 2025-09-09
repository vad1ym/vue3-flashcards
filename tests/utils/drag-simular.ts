import type { DOMWrapper } from '@vue/test-utils'
import { config } from '../../src/config'

export interface DragPosition {
  x: number | string
  y: number | string
}

export interface DragMovePosition {
  x?: number | string
  y?: number | string
}

export interface DragOptions {
  threshold?: number
}

/**
 * Core drag simulation class for testing FlashCard drag interactions
 */
export class DragSimulator {
  private element: Element
  private currentX = 0
  private currentY = 0
  private startX = 0
  private startY = 0
  private options: DragOptions

  constructor(element: HTMLElement | DOMWrapper<Element>, options: DragOptions = {}) {
    this.element = element instanceof Element ? element : element.element
    this.options = {
      threshold: options.threshold ?? config.defaultThreshold,
      ...options,
    }
  }

  private parsePosition(value: number | string, dimension: 'width' | 'height' = 'width'): number {
    if (typeof value === 'string' && value.endsWith('%')) {
      const percentage = Number.parseFloat(value.slice(0, -1)) / 100
      const rect = this.element.getBoundingClientRect()
      return (dimension === 'width' ? rect.width : rect.height) * percentage
    }
    return typeof value === 'number' ? value : Number.parseFloat(value)
  }

  private createPointerEvent(type: string, clientX: number, clientY: number): PointerEvent {
    return new PointerEvent(type, {
      clientX,
      clientY,
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: 'touch',
    })
  }

  dragStart(position: DragPosition = { x: '50%', y: '50%' }) {
    const rect = this.element.getBoundingClientRect()

    this.startX = rect.left + this.parsePosition(position.x, 'width')
    this.startY = rect.top + this.parsePosition(position.y, 'height')

    this.currentX = this.startX
    this.currentY = this.startY

    const event = this.createPointerEvent('pointerdown', this.currentX, this.currentY)
    this.element.dispatchEvent(event)

    return this
  }

  dragMove(moves: DragMovePosition[]) {
    for (const move of moves) {
      if (move.x !== undefined) {
        this.currentX = this.startX + this.parsePosition(move.x, 'width')
      }
      if (move.y !== undefined) {
        this.currentY = this.startY + this.parsePosition(move.y, 'height')
      }

      const event = this.createPointerEvent('pointermove', this.currentX, this.currentY)
      window.dispatchEvent(event)
    }

    return this
  }

  dragEnd() {
    const event = this.createPointerEvent('pointerup', this.currentX, this.currentY)
    window.dispatchEvent(event)

    return this
  }

  reset() {
    this.currentX = this.startX
    this.currentY = this.startY

    return this
  }

  // Helper methods using the raw class
  /**
   * Drag to a specific distance without ending
   * @param distance - Distance to drag (positive = right, negative = left)
   */
  dragTo(distance: number) {
    return this.dragStart().dragMove([{ x: distance }])
  }

  /**
   * Drag to a percentage of threshold (useful for testing rotation/indicators)
   * @param percentage - Percentage of threshold (0.5 = 50%, 1.0 = 100%, etc.)
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  dragToThreshold(percentage: number, threshold = config.defaultThreshold) {
    return this.dragTo(threshold * percentage)
  }

  /**
   * Drag to a percentage of threshold and end (complete drag cycle)
   * @param percentage - Percentage of threshold (0.5 = 50%, 1.0 = 100%, etc.)
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  dragAndRelease(percentage: number, threshold = config.defaultThreshold) {
    return this.dragToThreshold(percentage, threshold).dragEnd()
  }

  /**
   * Drag right to a specific percentage of threshold (without ending)
   * @param percentage - Percentage of threshold
   */
  dragRightToThreshold(percentage: number) {
    return this.dragToThreshold(percentage, this.options.threshold!)
  }

  /**
   * Drag left to a specific percentage of threshold (without ending)
   * @param percentage - Percentage of threshold
   */
  dragLeftToThreshold(percentage: number) {
    return this.dragToThreshold(-percentage, this.options.threshold!)
  }

  // --- BELOW THRESHOLD METHODS ---

  /**
   * Drag right below threshold (without ending) - for testing intermediate state
   */
  dragRightBelowThreshold() {
    return this.dragToThreshold(0.9, this.options.threshold!) // 90% of threshold, no dragEnd
  }

  /**
   * Drag left below threshold (without ending) - for testing intermediate state
   */
  dragLeftBelowThreshold() {
    return this.dragToThreshold(-0.9, this.options.threshold!) // 90% of threshold, no dragEnd
  }

  /**
   * Swipe right below threshold (complete cycle) - drag and release below threshold
   */
  swipeRightBelowThreshold() {
    return this.dragAndRelease(0.9, this.options.threshold!) // 90% of threshold + dragEnd
  }

  /**
   * Swipe left below threshold (complete cycle) - drag and release below threshold
   */
  swipeLeftBelowThreshold() {
    return this.dragAndRelease(-0.9, this.options.threshold!) // 90% of threshold + dragEnd
  }

  // --- BEYOND THRESHOLD METHODS ---

  /**
   * Drag right beyond threshold (without ending) - for testing intermediate state
   */
  dragRightBeyondThreshold() {
    return this.dragToThreshold(1.1, this.options.threshold!) // 110% of threshold, no dragEnd
  }

  /**
   * Drag left beyond threshold (without ending) - for testing intermediate state
   */
  dragLeftBeyondThreshold() {
    return this.dragToThreshold(-1.1, this.options.threshold!) // 110% of threshold, no dragEnd
  }

  /**
   * Swipe right beyond threshold (complete cycle) - full approval swipe
   */
  swipeRightBeyondThreshold() {
    return this.dragAndRelease(1.1, this.options.threshold!) // 110% of threshold + dragEnd
  }

  /**
   * Swipe left beyond threshold (complete cycle) - full rejection swipe
   */
  swipeLeftBeyondThreshold() {
    return this.dragAndRelease(-1.1, this.options.threshold!) // 110% of threshold + dragEnd
  }

  // --- ALIASES FOR BACKWARDS COMPATIBILITY ---

  /**
   * Alias for swipeRightBeyondThreshold - complete approval swipe
   */
  swipeApprove() {
    return this.swipeRightBeyondThreshold()
  }

  /**
   * Alias for swipeLeftBeyondThreshold - complete rejection swipe
   */
  swipeReject() {
    return this.swipeLeftBeyondThreshold()
  }
}
