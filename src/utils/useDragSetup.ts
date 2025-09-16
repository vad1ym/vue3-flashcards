import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, readonly, ref, toRef, toValue } from 'vue'
import { flashCardsDefaults } from '../config/flashcards.config'

export const SwipeAction = {
  APPROVE: 'approve',
  REJECT: 'reject',
} as const

export type SwipeAction = typeof SwipeAction[keyof typeof SwipeAction]

export interface DragSetupParams {
  // Distance in pixels the card must be dragged to complete swiping
  // If the card is dragged less than this distance, it will be restored to its original position
  threshold?: number

  // Distance in pixels the card must be dragged to start swiping, small value
  // Is need to prevent false positives (e.x. for card fliping feature)
  dragThreshold?: number

  // Max dragging in pixels, user cant drag moren than than value
  // Disabled by default
  maxDraggingY?: number | null
  maxDraggingX?: number | null

  // Completely disable dragging feature
  disableDrag?: boolean

  // Initial position for the card (used for animations)
  initialPosition?: DragPosition
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

  const threshold = computed(() => options.value.threshold ?? flashCardsDefaults.threshold)
  const dragThreshold = computed(() => options.value.dragThreshold ?? flashCardsDefaults.dragThreshold)
  const maxDraggingY = computed(() => options.value.maxDraggingY ?? null)
  const maxDraggingX = computed(() => options.value.maxDraggingX ?? null)

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

    if (maxDraggingX.value !== null) {
      limitedX = Math.max(-maxDraggingX.value, Math.min(maxDraggingX.value, x))
    }

    if (maxDraggingY.value !== null) {
      limitedY = Math.max(-maxDraggingY.value, Math.min(maxDraggingY.value, y))
    }

    const delta = Math.max(-1, Math.min(1, limitedX / threshold.value))

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

    if (position.x >= threshold.value) {
      onDragComplete('approve')
      position.delta = 1
      position.type = SwipeAction.APPROVE
    }
    else if (position.x <= -threshold.value) {
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
