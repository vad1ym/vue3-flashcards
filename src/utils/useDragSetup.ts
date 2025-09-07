import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, provide, reactive, readonly, ref, toRef } from 'vue'

export const DragType = {
  APPROVE: 'approve',
  REJECT: 'reject',
} as const

export type DragType = typeof DragType[keyof typeof DragType]

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
}

export interface DragSetupCallbacks {
  onDragStart?: () => void
  onDragMove?: (type: DragType | null, delta: number) => void
  onDragEnd?: () => void
  onComplete?: (approved: boolean) => void
}

export type DragSetupOptions = DragSetupParams & DragSetupCallbacks

// For nested components to notify about dragging state
export const IsDraggingStateInjectionKey = Symbol('is-dragging-key') as InjectionKey<Readonly<Ref<boolean>>>

export interface DragPosition {
  x: number
  y: number
  delta: number
  type: DragType | null
}

export function useDragSetup(el: MaybeRefOrGetter<HTMLDivElement | null>, _options: MaybeRefOrGetter<DragSetupOptions>) {
  const element = toRef(el)
  const options = toRef(_options)

  const {
    onDragStart = () => {},
    onDragMove = () => {},
    onDragEnd = () => {},
    onComplete = () => {},
  } = options.value

  const threshold = computed(() => options.value.threshold ?? 150)
  const dragThreshold = computed(() => options.value.dragThreshold ?? 5)
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

  const position = reactive<DragPosition>({
    x: 0,
    y: 0,
    delta: 0,
    type: null,
  })

  function restore() {
    Object.assign(position, {
      x: 0,
      y: 0,
      delta: 0,
      type: null,
    })
  }

  function handleDragStart(event: MouseEvent | TouchEvent) {
    isDragStarted.value = true

    if (event instanceof MouseEvent) {
      startX = event.clientX - position.x
      startY = event.clientY - position.y
    }
    else {
      startX = event.touches[0].clientX - position.x
      startY = event.touches[0].clientY - position.y
    }

    onDragStart()
  }

  function handleDragMove(event: MouseEvent | TouchEvent) {
    if (!isDragStarted.value) {
      return
    }

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY

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
      ? DragType.APPROVE
      : DragType.REJECT

    onDragMove(position.type, position.delta)
  }

  function handleDragEnd() {
    if (!isDragStarted.value) {
      return
    }

    isDragStarted.value = false
    isDragging.value = false

    if (position.x > threshold.value) {
      onComplete(true)
      position.delta = 1
      position.type = DragType.APPROVE
    }
    else if (position.x < -threshold.value) {
      onComplete(false)
      position.delta = -1
      position.type = DragType.REJECT
    }
    else {
      restore()
    }

    onDragEnd()
  }

  function setupInteract() {
    if (!element.value) {
      return
    }

    restore()

    // Touch events with passive optimization
    element.value.addEventListener('pointerdown', handleDragStart, { passive: false })
    window.addEventListener('pointermove', handleDragMove, { passive: false })
    window.addEventListener('pointerup', handleDragEnd, { passive: true })
  }

  function complete(type: DragType, threshold: number) {
    isDragging.value = false

    const sign = type === DragType.APPROVE ? 1 : -1
    Object.assign(position, {
      x: sign * Math.abs(threshold),
      y: 0,
      type,
      delta: sign,
    })

    onComplete(type === DragType.APPROVE)
  }

  onMounted(async () => {
    await nextTick()
    setupInteract()
  })

  onUnmounted(() => {
    element.value?.removeEventListener('pointerdown', handleDragStart)
    window.removeEventListener('pointermove', handleDragMove)
    window.removeEventListener('pointerup', handleDragEnd)
  })

  return {
    setupInteract,
    position,
    isDragging,
    restore,
    reject: () => complete(DragType.REJECT, -threshold.value - 1),
    approve: () => complete(DragType.APPROVE, threshold.value + 1),
  }
}
