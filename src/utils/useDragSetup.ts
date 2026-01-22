import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, readonly, ref, toRef, toValue } from 'vue'
import { flashCardsDefaults } from '../config/flashcards.config'

export const SwipeAction = {
  // Primary directional actions
  TOP: 'top',
  LEFT: 'left',
  RIGHT: 'right',
  BOTTOM: 'bottom',

  // Special action
  SKIP: 'skip',
} as const

export type SwipeAction = typeof SwipeAction[keyof typeof SwipeAction]

export type Direction = 'top' | 'left' | 'right' | 'bottom'

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

  // Direction of swiping, array of specific directions
  direction?: Direction[]

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

function inferDirectionFromPosition(x: number, y: number): Direction | null {
  // If both x and y are 0, no direction
  if (x === 0 && y === 0)
    return null

  // Determine direction based on dominant axis
  return Math.abs(x) >= Math.abs(y)
    ? (x > 0 ? 'right' : 'left')
    : (y > 0 ? 'bottom' : 'top')
}

function getDirectionFromPosition(
  x: number,
  y: number,
  enabledDirections: Direction[],
  threshold: number,
): Direction | null {
  // Find the dominant direction based on distance
  const absX = Math.abs(x)
  const absY = Math.abs(y)

  if (absX > absY) {
    // Horizontal is dominant
    if (enabledDirections.includes('right') && x > threshold)
      return 'right'
    if (enabledDirections.includes('left') && x < -threshold)
      return 'left'
  }
  else {
    // Vertical is dominant
    if (enabledDirections.includes('top') && y < -threshold)
      return 'top'
    if (enabledDirections.includes('bottom') && y > threshold)
      return 'bottom'
  }

  return null
}

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
  const swipeDirection = computed(() => options.value.direction)
  const enabledDirections = computed(() => swipeDirection.value)
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
    type: initialPos?.type ?? inferDirectionFromPosition(initialPos?.x ?? 0, initialPos?.y ?? 0),
  })

  function restore() {
    Object.assign(position, {
      x: 0,
      y: 0,
      delta: 0,
      type: null,
    })
  }

  function getDominantAxis(absX: number, absY: number, enabled: Direction[]) {
    const hasH = enabled.includes('left') || enabled.includes('right')
    const hasV = enabled.includes('top') || enabled.includes('bottom')

    if (hasH && !hasV)
      return 'horizontal'
    if (!hasH && hasV)
      return 'vertical'

    // true bidirectional
    return absX >= absY ? 'horizontal' : 'vertical'
  }

  function handleDragStart(event: PointerEvent) {
    isDragStarted.value = true

    startX = event.clientX - position.x
    startY = event.clientY - position.y

    onDragStart()
  }

  function handleDragMove(event: PointerEvent) {
    if (!isDragStarted.value)
      return

    const clientX = event.clientX
    const clientY = event.clientY

    const x = clientX - startX
    const y = clientY - startY

    const distance = Math.sqrt(x * x + y * y)
    if (distance < dragThreshold.value)
      return

    event.preventDefault()
    event.stopPropagation()

    isDragging.value = true

    let limitedX = x
    let limitedY = y

    if (maxDragX.value !== null)
      limitedX = Math.max(-maxDragX.value, Math.min(maxDragX.value, x))

    if (maxDragY.value !== null)
      limitedY = Math.max(-maxDragY.value, Math.min(maxDragY.value, y))

    const absX = Math.abs(limitedX)
    const absY = Math.abs(limitedY)

    const axis = getDominantAxis(absX, absY, enabledDirections.value || [])

    const isHorizontal = axis === 'horizontal'
    let primaryAxis = isHorizontal ? limitedX : -limitedY

    let currentDirection: Direction | null = null

    if (absX > dragThreshold.value || absY > dragThreshold.value) {
      if (isHorizontal)
        currentDirection = limitedX > 0 ? 'right' : 'left'
      else
        currentDirection = limitedY > 0 ? 'bottom' : 'top'
    }

    // Resistance
    if (resistanceEffect.value && Math.abs(primaryAxis) > resistanceThreshold.value) {
      const excess = Math.abs(primaryAxis) - resistanceThreshold.value
      const resistanceMultiplier = 1 / (1 + excess * resistanceStrength.value / 35)
      const resistedExcess = excess * resistanceMultiplier
      const dir = primaryAxis >= 0 ? 1 : -1
      const resistancePos = resistanceThreshold.value + resistedExcess

      if (isHorizontal) {
        limitedX = resistancePos * dir
        primaryAxis = limitedX
      }
      else {
        limitedY = -resistancePos * dir
        primaryAxis = -limitedY
      }
    }

    const delta = Math.max(-1, Math.min(1, primaryAxis / swipeThreshold.value))

    position.x = limitedX
    position.y = limitedY
    position.delta = delta
    position.type = currentDirection

    onDragMove(position.type, position.delta)
  }

  function handleDragEnd() {
    if (!isDragStarted.value) {
      return
    }

    isDragStarted.value = false
    isDragging.value = false

    // Determine if swipe completion threshold is reached
    const completedDirection = getDirectionFromPosition(
      position.x,
      position.y,
      enabledDirections.value || [],
      swipeThreshold.value,
    )

    if (completedDirection) {
      onDragComplete(completedDirection)

      // Update position to reflect completion
      switch (completedDirection) {
        case 'right':
          position.delta = 1
          break
        case 'left':
          position.delta = -1
          break
        case 'top':
          position.delta = 1
          break
        case 'bottom':
          position.delta = -1
          break
      }

      position.type = completedDirection
    }
    else {
      restore()
    }

    onDragEnd()
  }

  function setupInteract() {
    // Set initial position
    const initialPos = options.value.initialPosition
    Object.assign(position, {
      x: initialPos?.x || 0,
      y: initialPos?.y || 0,
      delta: initialPos?.delta || 0,
      type: initialPos?.type ?? inferDirectionFromPosition(initialPos?.x ?? 0, initialPos?.y ?? 0),
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
    getDominantAxis,
  }
}
