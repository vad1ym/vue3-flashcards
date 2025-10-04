import type { Ref } from 'vue'
import { ref } from 'vue'

export interface GhostAnimationOptions {
  /**
   * Element to clone
   */
  element: HTMLElement

  /**
   * Animation type (approve/reject)
   */
  animationType: string

  /**
   * Whether this is a restore animation
   */
  isRestoring: boolean

  /**
   * Swipe direction for animation classes
   */
  swipeDirection?: string

  /**
   * Initial position from drag (optional)
   */
  initialPosition?: {
    x: number
    y: number
  }

  /**
   * Function to get transform style based on position
   */
  getTransformStyle?: (position: { x: number, y: number, delta: number, type: any }) => string | null

  /**
   * Callback when animation ends
   */
  onAnimationEnd: () => void
}

/**
 * Creates and manages a ghost clone for animations
 */
export function createGhostElement(options: GhostAnimationOptions): HTMLElement {
  const {
    element,
    animationType,
    isRestoring,
    swipeDirection,
    initialPosition,
    getTransformStyle,
    onAnimationEnd,
  } = options

  // Clone the card element
  const clone = element.cloneNode(true) as HTMLElement
  clone.classList.add('flash-card--ghost')
  clone.style.pointerEvents = 'none'

  // Get current position from the card
  const rect = element.getBoundingClientRect()

  // Position ghost exactly over original
  clone.style.position = 'fixed'
  clone.style.top = `${rect.top}px`
  clone.style.left = `${rect.left}px`
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.zIndex = '9999'
  clone.style.transform = 'none'

  // Get animation wrapper
  const animationWrapper = clone.querySelector('.flash-card__animation-wrapper') as HTMLElement
  const transformWrapper = animationWrapper?.querySelector('.flash-card__transform') as HTMLElement

  // Apply initial position if provided (for drag animations)
  if (initialPosition && !isRestoring && animationWrapper && transformWrapper) {
    clone.style.top = `${rect.top - initialPosition.y}px`
    clone.style.left = `${rect.left - initialPosition.x}px`
    animationWrapper.style.transform = `translate3d(${initialPosition.x}px, ${initialPosition.y}px, 0)`
  }

  // Always apply current transform style to ghost if available
  if (animationWrapper && transformWrapper) {
    // First, copy the current computed transform from the original element
    const originalTransformWrapper = element.querySelector('.flash-card__transform') as HTMLElement
    if (originalTransformWrapper) {
      const computedStyle = window.getComputedStyle(originalTransformWrapper)
      const currentTransform = computedStyle.transform
      if (currentTransform && currentTransform !== 'none') {
        transformWrapper.style.transform = currentTransform
      }
    }

    // Then apply additional transform style if provided
    if (getTransformStyle) {
      const rotationStyle = getTransformStyle({ x: 0, y: 0, delta: 0, type: null, ...initialPosition })
      if (rotationStyle) {
        // Extract transform value from rotationStyle and apply it
        const transformMatch = rotationStyle.match(/transform:\s*([^;]+)/)
        if (transformMatch) {
          transformWrapper.style.transform = transformMatch[1]
        }
      }
    }
  }

  // Insert into document
  document.body.appendChild(clone)

  // Force reflow
  void clone.offsetHeight

  // Apply animation classes
  if (animationWrapper) {
    animationWrapper.classList.add(`flash-card-animation--${animationType}`)
    if (isRestoring) {
      animationWrapper.classList.add(`flash-card-animation--${animationType}-restore`)
    }
    if (swipeDirection) {
      animationWrapper.classList.add(`flash-card-animation--${swipeDirection}`)
    }
  }

  // Listen for animation end
  const handleAnimationEnd = (e: AnimationEvent) => {
    if (e.target !== animationWrapper)
      return

    clone.removeEventListener('animationend', handleAnimationEnd)
    onAnimationEnd()
  }

  clone.addEventListener('animationend', handleAnimationEnd)

  return clone
}

/**
 * Composable for managing ghost animations
 */
export function useGhostAnimation(elementRef: Ref<HTMLElement | null | undefined>) {
  const ghostElement = ref<HTMLElement | null>(null)
  const isAnimating = ref(false)

  function cleanup() {
    ghostElement.value?.remove()
    ghostElement.value = null
    isAnimating.value = false
  }

  function createGhost(options: Omit<GhostAnimationOptions, 'element' | 'onAnimationEnd'>, onAnimationEnd: () => void) {
    if (!elementRef.value)
      return

    // Cleanup existing ghost
    if (ghostElement.value) {
      cleanup()
    }

    ghostElement.value = createGhostElement({
      ...options,
      element: elementRef.value,
      onAnimationEnd: () => {
        cleanup()
        onAnimationEnd()
      },
    })

    isAnimating.value = true
  }

  return {
    ghostElement,
    isAnimating,
    createGhost,
    cleanup,
  }
}
