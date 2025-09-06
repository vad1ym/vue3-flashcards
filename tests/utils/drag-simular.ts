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

/**
 * Core drag simulation class for testing FlashCard drag interactions
 */
export class DragSimulator {
  private element: HTMLElement
  private currentX = 0
  private currentY = 0
  private startX = 0
  private startY = 0

  constructor(element: HTMLElement | DOMWrapper<HTMLElement>) {
    this.element = element instanceof HTMLElement ? element : element.element
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
   * Quick drag right to a specific percentage of threshold (without ending)
   * @param percentage - Percentage of threshold
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  dragRightTo(percentage: number, threshold = config.defaultThreshold) {
    return this.dragToThreshold(percentage, threshold)
  }

  /**
   * Quick drag left to a specific percentage of threshold (without ending)
   * @param percentage - Percentage of threshold
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  dragLeftTo(percentage: number, threshold = config.defaultThreshold) {
    return this.dragToThreshold(-percentage, threshold)
  }

  /**
   * Swipe right beyond threshold (complete approval)
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  swipeApprove(threshold = config.defaultThreshold) {
    return this.dragAndRelease(1.1, threshold) // 110% of threshold
  }

  /**
   * Swipe left beyond threshold (complete rejection)
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  swipeReject(threshold = config.defaultThreshold) {
    return this.dragAndRelease(-1.1, threshold) // 110% of threshold in opposite direction
  }

  /**
   * Drag right below threshold (should restore, not complete)
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  dragRightBelowThreshold(threshold = config.defaultThreshold) {
    return this.dragAndRelease(0.9, threshold) // 90% of threshold
  }

  /**
   * Drag left below threshold (should restore, not complete)
   * @param threshold - The threshold value (defaults to config.defaultThreshold)
   */
  dragLeftBelowThreshold(threshold = config.defaultThreshold) {
    return this.dragAndRelease(-0.9, threshold) // 90% of threshold in opposite direction
  }
}
