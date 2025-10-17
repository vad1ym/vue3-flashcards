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
    onAnimationEnd,
  } = options

  // Clone the card element
  const clone = element.cloneNode(true) as HTMLElement
  clone.classList.add('flash-card--ghost')
  clone.style.pointerEvents = 'none'

  // Get current position from the card
  const rect = element.getBoundingClientRect()
  const container = element.closest('.flashcards')!

  // Calculate position relative to the container
  const containerRect = container.getBoundingClientRect()
  const relativeTop = rect.top - containerRect.top
  const relativeLeft = rect.left - containerRect.left

  // Position clone absolutely over the original card
  clone.style.position = 'absolute'
  clone.style.top = `${relativeTop}px`
  clone.style.left = `${relativeLeft}px`
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.zIndex = '9999'
  clone.style.transform = 'none'

  // Get animation wrapper
  const animationWrapper = clone.querySelector('.flash-card__animation-wrapper') as HTMLElement

  // Insert clone directly into the container
  container.appendChild(clone)

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
