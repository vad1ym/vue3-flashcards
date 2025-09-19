import type { DOMWrapper } from '@vue/test-utils'
import { flashCardsDefaults } from '../../src/config/flashcards.config'

export interface DragPosition {
  x: number | string
  y: number | string
}

export interface DragMovePosition {
  x?: number | string
  y?: number | string
}

export interface DragOptions {
  swipeThreshold?: number
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
      swipeThreshold: options.swipeThreshold ?? flashCardsDefaults.swipeThreshold,
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
  dragTo(distance: number): DragSimulator
  dragTo(coords: { x?: number, y?: number }): DragSimulator
  dragTo(distanceOrCoords: number | { x?: number, y?: number }) {
    if (typeof distanceOrCoords === 'number') {
      return this.dragStart().dragMove([{ x: distanceOrCoords }])
    }
    else {
      return this.dragStart().dragMove([{ x: distanceOrCoords.x || 0, y: distanceOrCoords.y || 0 }])
    }
  }

  /**
   * Drag to a percentage of swipeThreshold (useful for testing rotation/indicators)
   * @param percentage - Percentage of swipeThreshold (0.5 = 50%, 1.0 = 100%, etc.)
   * @param swipeThreshold - The swipeThreshold value (defaults to flashCardsDefaults.swipeThreshold)
   */
  dragToThreshold(percentage: number, swipeThreshold = flashCardsDefaults.swipeThreshold) {
    return this.dragTo(swipeThreshold * percentage)
  }

  /**
   * Drag to a percentage of swipeThreshold and end (complete drag cycle)
   * @param percentage - Percentage of swipeThreshold (0.5 = 50%, 1.0 = 100%, etc.)
   * @param swipeThreshold - The swipeThreshold value (defaults to flashCardsDefaults.swipeThreshold)
   */
  dragAndRelease(percentage: number, swipeThreshold = flashCardsDefaults.swipeThreshold) {
    return this.dragToThreshold(percentage, swipeThreshold).dragEnd()
  }

  /**
   * Drag right to a specific percentage of swipeThreshold (without ending)
   * @param percentage - Percentage of swipeThreshold
   */
  dragRightToThreshold(percentage: number) {
    return this.dragToThreshold(percentage, this.options.swipeThreshold!)
  }

  /**
   * Drag left to a specific percentage of swipeThreshold (without ending)
   * @param percentage - Percentage of swipeThreshold
   */
  dragLeftToThreshold(percentage: number) {
    return this.dragToThreshold(-percentage, this.options.swipeThreshold!)
  }

  // --- BELOW THRESHOLD METHODS ---

  /**
   * Drag right below swipeThreshold (without ending) - for testing intermediate state
   */
  dragRightBelowThreshold() {
    return this.dragToThreshold(0.9, this.options.swipeThreshold!) // 90% of swipeThreshold, no dragEnd
  }

  /**
   * Drag left below swipeThreshold (without ending) - for testing intermediate state
   */
  dragLeftBelowThreshold() {
    return this.dragToThreshold(-0.9, this.options.swipeThreshold!) // 90% of swipeThreshold, no dragEnd
  }

  /**
   * Swipe right below swipeThreshold (complete cycle) - drag and release below swipeThreshold
   */
  swipeRightBelowThreshold() {
    return this.dragAndRelease(0.9, this.options.swipeThreshold!) // 90% of swipeThreshold + dragEnd
  }

  /**
   * Swipe left below swipeThreshold (complete cycle) - drag and release below swipeThreshold
   */
  swipeLeftBelowThreshold() {
    return this.dragAndRelease(-0.9, this.options.swipeThreshold!) // 90% of swipeThreshold + dragEnd
  }

  // --- BEYOND THRESHOLD METHODS ---

  /**
   * Drag right beyond swipeThreshold (without ending) - for testing intermediate state
   */
  dragRightBeyondThreshold() {
    return this.dragToThreshold(1.1, this.options.swipeThreshold!) // 110% of swipeThreshold, no dragEnd
  }

  /**
   * Drag left beyond swipeThreshold (without ending) - for testing intermediate state
   */
  dragLeftBeyondThreshold() {
    return this.dragToThreshold(-1.1, this.options.swipeThreshold!) // 110% of swipeThreshold, no dragEnd
  }

  /**
   * Swipe right beyond swipeThreshold (complete cycle) - full approval swipe
   */
  swipeRightBeyondThreshold() {
    return this.dragAndRelease(1.1, this.options.swipeThreshold!) // 110% of swipeThreshold + dragEnd
  }

  /**
   * Swipe left beyond swipeThreshold (complete cycle) - full rejection swipe
   */
  swipeLeftBeyondThreshold() {
    return this.dragAndRelease(-1.1, this.options.swipeThreshold!) // 110% of swipeThreshold + dragEnd
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
