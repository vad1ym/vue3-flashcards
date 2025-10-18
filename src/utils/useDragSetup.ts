import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, readonly, ref, toRef, toValue } from 'vue'
import { flashCardsDefaults } from '../config/flashcards.config'

export const SwipeAction = {
  APPROVE: 'approve',
  REJECT: 'reject',
  SKIP: 'skip',
} as const

export type SwipeAction = typeof SwipeAction[keyof typeof SwipeAction]

export interface DragSetupParams {
  // Distance in pixels the card must be dragged to complete swiping
  // If the card is dragged less than this distance, it will be restored to its original position
  swipeThreshold?: number

  // Distance in pixels the card must be dragged to start swiping, small value
  // Is need to prevent false positives (e.x. for card fliping feature)
  dragThreshold?: number

  // Max dragging in pixels, user cant drag moren than than value
  // Disabled by default
  maxDragY?: number | null
  maxDragX?: number | null

  // Direction of swiping: horizontal (left/right) or vertical (up/down)
  swipeDirection?: 'horizontal' | 'vertical'

  // Completely disable dragging feature
  disableDrag?: boolean

  // Initial position for the card (used for animations)
  initialPosition?: DragPosition

  // Enable resistance effect when dragging beyond threshold
  resistanceEffect?: boolean

  // Distance threshold for resistance effect to activate
  resistanceThreshold?: number

  // Strength of resistance (0-1, where 1 is maximum resistance)
  resistanceStrength?: number
}

export interface DragSetupCallbacks {
  onDragStart?: () => void
  onDragMove?: (type: SwipeAction | null, delta: number) => void
  onDragEnd?: () => void
  onDragComplete?: (action: SwipeAction) => void
}

export type DragSetupOptions = DragSetupParams & DragSetupCallbacks

// For nested components to notify about dragging state
export const IsDraggingStateInjectionKey = Symbol('is-dragging-key') as InjectionKey<Readonly<Ref<boolean>>>

export interface DragPosition {
  x: number
  y: number
  delta: number
  type?: SwipeAction | null
}

export function useDragSetup(el: MaybeRefOrGetter<HTMLDivElement | null>, _options: MaybeRefOrGetter<DragSetupOptions>) {
  const element = toRef(el)
  const options = computed(() => toValue(_options))

  const {
    onDragStart = () => {},
    onDragMove = () => {},
    onDragEnd = () => {},
    onDragComplete = () => {},
  } = options.value

  const swipeThreshold = computed(() => options.value.swipeThreshold ?? flashCardsDefaults.swipeThreshold)
  const dragThreshold = computed(() => options.value.dragThreshold ?? flashCardsDefaults.dragThreshold)
  const maxDragY = computed(() => options.value.maxDragY ?? null)
  const maxDragX = computed(() => options.value.maxDragX ?? null)
  const swipeDirection = computed(() => options.value.swipeDirection ?? flashCardsDefaults.swipeDirection)
  const resistanceEffect = computed(() => options.value.resistanceEffect ?? flashCardsDefaults.resistanceEffect)
  const resistanceThreshold = computed(() => options.value.resistanceThreshold ?? flashCardsDefaults.resistanceThreshold)
  const resistanceStrength = computed(() => options.value.resistanceStrength ?? flashCardsDefaults.resistanceStrength)

  // Is drag started
  const isDragStarted = ref(false)

  // Is dragging in progress
  const isDragging = ref(false)

  let startX = 0
  let startY = 0

  // Provide dragging state to nested components
  provide(IsDraggingStateInjectionKey, readonly(isDragging))

  const initialPos = options.value.initialPosition
  const position = reactive<DragPosition>({
    x: initialPos?.x || 0,
    y: initialPos?.y || 0,
    delta: initialPos?.delta || 0,
    type: initialPos?.delta ? (initialPos.delta > 0 ? SwipeAction.APPROVE : SwipeAction.REJECT) : null,
  })

  function restore() {
    Object.assign(position, {
      x: 0,
      y: 0,
      delta: 0,
      type: null,
    })
  }

  function handleDragStart(event: PointerEvent) {
    isDragStarted.value = true

    startX = event.clientX - position.x
    startY = event.clientY - position.y

    onDragStart()
  }

  function handleDragMove(event: PointerEvent) {
    if (!isDragStarted.value) {
      return
    }

    const clientX = event.clientX
    const clientY = event.clientY

    const x = clientX - startX
    const y = clientY - startY

    const distance = Math.sqrt(x * x + y * y)
    if (distance < dragThreshold.value) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    isDragging.value = true

    // Apply dragging limits if provided
    let limitedX = x
    let limitedY = y

    if (maxDragX.value !== null) {
      limitedX = Math.max(-maxDragX.value, Math.min(maxDragX.value, x))
    }

    if (maxDragY.value !== null) {
      limitedY = Math.max(-maxDragY.value, Math.min(maxDragY.value, y))
    }

    const isHorizontal = swipeDirection.value === 'horizontal'
    let primaryAxis = isHorizontal ? limitedX : -limitedY // Invert Y axis for vertical swipe (up = positive, down = negative)

    // Apply resistance effect if enabled and beyond threshold
    if (resistanceEffect.value && Math.abs(primaryAxis) > resistanceThreshold.value) {
      const excessDistance = Math.abs(primaryAxis) - resistanceThreshold.value

      // Apply resistance to excess movement only
      const resistanceMultiplier = 1 / (1 + excessDistance * resistanceStrength.value / 35)
      const resistedExcess = excessDistance * resistanceMultiplier

      // Final position = threshold + resisted excess movement
      const direction = primaryAxis >= 0 ? 1 : -1
      const resistancePosition = resistanceThreshold.value + resistedExcess

      // Apply resistance effect to the appropriate axis
      if (isHorizontal) {
        limitedX = resistancePosition * direction
      }
      else {
        limitedY = -resistancePosition * direction // Invert for vertical
      }

      primaryAxis = isHorizontal ? limitedX : -limitedY
    }

    const delta = Math.max(-1, Math.min(1, primaryAxis / swipeThreshold.value))

    position.x = limitedX
    position.y = limitedY
    position.delta = delta

    position.type = delta && delta > 0
      ? SwipeAction.APPROVE
      : SwipeAction.REJECT

    onDragMove(position.type, position.delta)
  }

  function handleDragEnd() {
    if (!isDragStarted.value) {
      return
    }

    isDragStarted.value = false
    isDragging.value = false

    const isHorizontal = swipeDirection.value === 'horizontal'
    const primaryAxis = isHorizontal ? position.x : -position.y // Invert Y axis for vertical swipe (up = positive, down = negative)

    if (primaryAxis >= swipeThreshold.value) {
      onDragComplete('approve')
      position.delta = 1
      position.type = SwipeAction.APPROVE
    }
    else if (primaryAxis <= -swipeThreshold.value) {
      onDragComplete('reject')
      position.delta = -1
      position.type = SwipeAction.REJECT
    }
    else {
      restore()
    }

    onDragEnd()
  }

  function setupInteract() {
    // Устанавливаем начальную позицию
    const initialPos = options.value.initialPosition
    Object.assign(position, {
      x: initialPos?.x || 0,
      y: initialPos?.y || 0,
      delta: initialPos?.delta || 0,
      type: initialPos?.delta ? (initialPos.delta > 0 ? SwipeAction.APPROVE : SwipeAction.REJECT) : null,
    })

    // Don't add event listeners if dragging is disabled
    if (options.value.disableDrag) {
      return
    }

    // Touch events with passive optimization
    element.value?.addEventListener('pointerdown', handleDragStart, { passive: false })
    window.addEventListener('pointermove', handleDragMove, { passive: false })
    window.addEventListener('pointerup', handleDragEnd, { passive: true })
  }

  onMounted(async () => {
    await nextTick()
    setupInteract()
  })

  function cleanupInteract() {
    element.value?.removeEventListener('pointerdown', handleDragStart)
    window.removeEventListener('pointermove', handleDragMove)
    window.removeEventListener('pointerup', handleDragEnd)
  }

  onUnmounted(() => {
    cleanupInteract()
  })

  return {
    setupInteract,
    cleanupInteract,
    position,
    isDragging,
    restore,
  }
}
