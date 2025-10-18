import type { Ref } from 'vue'
import { ref } from 'vue'

/**
 * Creates a simple ghost clone for animations
 */
export function createGhostElement(element: HTMLElement, animationType: string, isRestoring: boolean = false, swipeDirection?: string): HTMLElement {
  // Clone the element
  const clone = element.closest('.flashcards__card-wrapper')?.cloneNode(true) as HTMLElement
  clone.classList.add('flash-card--ghost')

  // Get current position and size from the original element
  const container = element.closest('.flashcards') as HTMLElement

  // Add to container
  container.appendChild(clone)

  // Force reflow
  void clone.offsetHeight

  // Apply animation classes
  const animationWrapper = clone.querySelector('.flash-card__animation-wrapper') as HTMLElement
  if (animationWrapper) {
    animationWrapper.classList.add(`flash-card-animation--${animationType}`)
    if (isRestoring) {
      animationWrapper.classList.add(`flash-card-animation--${animationType}-restore`)
    }
    if (swipeDirection) {
      animationWrapper.classList.add(`flash-card-animation--${swipeDirection}`)
    }
  }

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

  function createGhost(options: {
    animationType: string
    isRestoring?: boolean
    swipeDirection?: string
  }, onAnimationEnd: () => void) {
    if (!elementRef.value)
      return

    // Cleanup existing ghost
    if (ghostElement.value) {
      cleanup()
    }

    ghostElement.value = createGhostElement(
      elementRef.value,
      options.animationType,
      options.isRestoring || false,
      options.swipeDirection,
    )

    // Listen for animation end
    const handleAnimationEnd = (e: AnimationEvent) => {
      const animationWrapper = ghostElement.value?.querySelector('.flash-card__animation-wrapper') as HTMLElement
      if (e.target !== animationWrapper)
        return

      cleanup()
      onAnimationEnd()
    }

    ghostElement.value.addEventListener('animationend', handleAnimationEnd)
    isAnimating.value = true
  }

  return {
    ghostElement,
    isAnimating,
    createGhost,
    cleanup,
  }
}
