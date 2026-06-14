import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, readonly, ref, toRef, toValue } from 'vue'
import { flashCardsDefaults, resistanceDefaults, velocityDefaults } from '../config/flashcards.config'

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

  // Resistance ("rubber-band") effect when dragging beyond a threshold.
  // Disabled by default (`null`). Pass an object to enable, with optional
  // `threshold` (px before resistance kicks in) and `strength` (0-1, where 1 is
  // maximum resistance). An empty object `{}` uses the defaults for both.
  resistance?: ResistanceOptions | null

  // Velocity-based ("flick") swipe completion: a fast flick completes the swipe
  // even if the card was released before reaching `swipeThreshold`. Enabled by
  // default. Pass `null` to disable, or an object to tune the threshold.
  // (Disable sentinel is `null`, not `false`, so Vue doesn't infer a Boolean
  // prop and coerce an absent value to disabled.)
  velocity?: VelocityOptions | null
}

export interface ResistanceOptions {
  // Distance (px) the card can move freely before resistance starts. Default 150.
  threshold?: number
  // Resistance strength, 0-1 (1 = maximum resistance). Default 0.3.
  strength?: number
}

export interface VelocityOptions {
  // Minimum pointer speed (px/ms) along the dominant axis at release that
  // triggers a flick completion. Default 0.5.
  threshold?: number
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

// Resolve the swipe direction implied by a fast flick at release. Unlike
// `getDirectionFromPosition` (distance-based), this looks at the pointer
// velocity along each axis: a quick flick completes the swipe even when the card
// was released short of `swipeThreshold`. The flick must point the same way the
// card was already dragged (sign of velocity matches sign of offset) so a brief
// jitter in the opposite direction never flings the card the wrong way.
function getDirectionFromVelocity(
  x: number,
  y: number,
  vx: number,
  vy: number,
  enabledDirections: Direction[],
  velocityThreshold: number,
): Direction | null {
  const absVX = Math.abs(vx)
  const absVY = Math.abs(vy)

  // Dominant axis is whichever the flick is faster along.
  if (absVX >= absVY) {
    if (absVX < velocityThreshold)
      return null
    if (enabledDirections.includes('right') && vx > 0 && x > 0)
      return 'right'
    if (enabledDirections.includes('left') && vx < 0 && x < 0)
      return 'left'
  }
  else {
    if (absVY < velocityThreshold)
      return null
    if (enabledDirections.includes('top') && vy < 0 && y < 0)
      return 'top'
    if (enabledDirections.includes('bottom') && vy > 0 && y > 0)
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
  // Resistance is off unless `resistance` is an object. Each field falls back to
  // the library default.
  const resistanceEffect = computed(() => !!options.value.resistance)
  const resistanceThreshold = computed(() => {
    const r = options.value.resistance
    return (r && r.threshold) ?? resistanceDefaults.threshold
  })
  const resistanceStrength = computed(() => {
    const r = options.value.resistance
    return (r && r.strength) ?? resistanceDefaults.strength
  })
  // Velocity ("flick") completion is ON by default. `velocity: null` disables
  // it; an object tunes the threshold. (We use `null`, not `false`, as the
  // disable sentinel so Vue doesn't infer a Boolean prop and coerce an absent
  // value to `false` — that would silently disable the default-on behaviour.)
  const swipeVelocityEnabled = computed(() => options.value.velocity !== null)
  const swipeVelocityThreshold = computed(() => {
    const v = options.value.velocity
    return (v && v.threshold) ?? velocityDefaults.threshold
  })

  // Is drag started
  const isDragStarted = ref(false)

  // Is dragging in progress
  const isDragging = ref(false)

  // Track active pointer ID for multi-touch prevention
  const activePointerId = ref<number | null>(null)

  let startX = 0
  let startY = 0

  // Recent pointer samples (position + timestamp) used to estimate release
  // velocity for flick detection. We keep a short trailing window so the
  // velocity reflects the final motion, not the whole gesture.
  const VELOCITY_SAMPLE_WINDOW = 100 // ms
  // Minimum time the samples must span before we trust a velocity reading.
  // Below this, a few near-instant moves (e.g. a synthetic/programmatic jump)
  // would read as an implausibly high speed, so we treat velocity as zero.
  const MIN_VELOCITY_INTERVAL = 5 // ms
  let samples: { x: number, y: number, t: number }[] = []

  function now() {
    return typeof performance !== 'undefined' ? performance.now() : Date.now()
  }

  function recordSample(x: number, y: number) {
    const t = now()
    samples.push({ x, y, t })
    // Drop samples older than the trailing window (keep at least one fallback).
    while (samples.length > 1 && t - samples[0].t > VELOCITY_SAMPLE_WINDOW)
      samples.shift()
  }

  // Velocity (px/ms) along each axis from the oldest in-window sample to the last.
  function getVelocity() {
    if (samples.length < 2)
      return { vx: 0, vy: 0 }

    const first = samples[0]
    const last = samples[samples.length - 1]
    const dt = last.t - first.t
    if (dt < MIN_VELOCITY_INTERVAL)
      return { vx: 0, vy: 0 }

    return {
      vx: (last.x - first.x) / dt,
      vy: (last.y - first.y) / dt,
    }
  }

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
    activePointerId.value = event.pointerId

    startX = event.clientX - position.x
    startY = event.clientY - position.y

    samples = []
    recordSample(position.x, position.y)

    onDragStart()
  }

  function handleDragMove(event: PointerEvent) {
    if (!isDragStarted.value)
      return

    // Multi-touch prevention: ignore events from different pointers
    if (activePointerId.value !== null && event.pointerId !== activePointerId.value) {
      return
    }

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

    recordSample(limitedX, limitedY)

    onDragMove(position.type, position.delta)
  }

  function handleDragEnd() {
    if (!isDragStarted.value) {
      return
    }

    isDragStarted.value = false
    isDragging.value = false
    activePointerId.value = null

    // Determine if swipe completion threshold is reached
    let completedDirection = getDirectionFromPosition(
      position.x,
      position.y,
      enabledDirections.value || [],
      swipeThreshold.value,
    )

    // Fall back to velocity-based ("flick") completion: a quick release short of
    // the distance threshold still completes the swipe if it was fast enough.
    if (!completedDirection && swipeVelocityEnabled.value) {
      const { vx, vy } = getVelocity()
      completedDirection = getDirectionFromVelocity(
        position.x,
        position.y,
        vx,
        vy,
        enabledDirections.value || [],
        swipeVelocityThreshold.value,
      )
    }

    samples = []

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

  // Prevent scroll on any element while dragging
  function handleTouchMove(event: TouchEvent) {
    if (isDragging.value) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  // Prevent wheel scroll while dragging
  function handleWheel(event: WheelEvent) {
    if (isDragging.value) {
      event.preventDefault()
      event.stopPropagation()
    }
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

    // Add global scroll prevention listeners (with passive: false to allow preventDefault)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('wheel', handleWheel, { passive: false })
  }

  onMounted(async () => {
    await nextTick()
    setupInteract()
  })

  function cleanupInteract() {
    element.value?.removeEventListener('pointerdown', handleDragStart)
    window.removeEventListener('pointermove', handleDragMove)
    window.removeEventListener('pointerup', handleDragEnd)

    // Remove global scroll prevention listeners
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('wheel', handleWheel)
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
