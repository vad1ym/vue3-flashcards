import type { MaybeRefOrGetter } from 'vue'
import { computed, onUnmounted, reactive, ref, toRef } from 'vue'

export enum DragType {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export interface DragSetupParams {
  // Max rotation in degrees the card can be rotated on swipe
  maxRotation?: number

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

export interface DragPosition {
  x: number
  y: number
  rotation: number
  delta: number
  type: DragType | null
}

export function useDragSetup(_options: MaybeRefOrGetter<DragSetupOptions>) {
  const options = toRef(_options)

  const {
    onDragStart = () => {},
    onDragMove = () => {},
    onDragEnd = () => {},
    onComplete = () => {},
  } = options.value

  const maxRotation = computed(() => options.value.maxRotation ?? 20)
  const threshold = computed(() => options.value.threshold ?? 150)
  const dragThreshold = computed(() => options.value.dragThreshold ?? 5)
  const maxDraggingY = computed(() => options.value.maxDraggingY ?? null)
  const maxDraggingX = computed(() => options.value.maxDraggingX ?? null)

  const sourceEl = ref<HTMLElement | null>(null)
  const isDrag = ref(false)
  const isDragging = ref(false)
  const isAnimating = ref(false)
  let startX = 0
  let startY = 0

  const position = reactive<DragPosition>({
    x: 0,
    y: 0,
    rotation: 0,
    delta: 0,
    type: null,
  })

  function restore() {
    Object.assign(position, {
      x: 0,
      y: 0,
      rotation: 0,
      delta: 0,
      type: null,
    })
  }

  function handleDragStart(event: MouseEvent | TouchEvent) {
    event.preventDefault()

    isAnimating.value = false
    isDrag.value = true

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
    if (!isDrag.value || isAnimating.value)
      return

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY

    const x = clientX - startX
    const y = clientY - startY

    const distance = Math.sqrt(x * x + y * y)
    if (!isDragging.value && distance < dragThreshold.value) {
      return
    }

    if (!isDragging.value) {
      isDragging.value = true
    }

    event.preventDefault()
    event.stopPropagation()

    // Apply dragging limits if provided
    let limitedX = x
    let limitedY = y

    if (maxDraggingX.value !== null) {
      limitedX = Math.max(-maxDraggingX.value, Math.min(maxDraggingX.value, x))
    }

    if (maxDraggingY.value !== null) {
      limitedY = Math.max(-maxDraggingY.value, Math.min(maxDraggingY.value, y))
    }

    let rotate = maxRotation.value * (limitedX / threshold.value)
    rotate = Math.max(-maxRotation.value, Math.min(maxRotation.value, rotate))

    position.x = limitedX
    position.y = limitedY
    position.rotation = rotate
    position.type = rotate > 0 ? DragType.APPROVE : rotate < 0 ? DragType.REJECT : null

    const opacityAmount = Math.abs(rotate) / maxRotation.value
    position.delta = opacityAmount

    onDragMove(position.type, opacityAmount)
  }

  function handleDragEnd() {
    if (!isDrag.value) {
      return
    }

    isAnimating.value = true
    setTimeout(() => {
      isDrag.value = false
      isDragging.value = false
    }, 100)

    if (position.x > threshold.value) {
      onComplete(true)
      position.delta = 1
    }
    else if (position.x < -threshold.value) {
      onComplete(false)
      position.delta = 1
    }
    else {
      restore()
    }

    onDragEnd()
  }

  function setupInteract(el: HTMLElement) {
    sourceEl.value = el
    restore()

    // Optimize for transforms
    el.style.willChange = 'transform'
    el.style.touchAction = 'none'

    // Mouse events
    el.addEventListener('mousedown', handleDragStart)
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)

    // Touch events with passive optimization
    el.addEventListener('touchstart', handleDragStart, { passive: false })
    window.addEventListener('touchmove', handleDragMove, { passive: false })
    window.addEventListener('touchend', handleDragEnd, { passive: true })
  }

  function complete(type: DragType, threshold: number) {
    isAnimating.value = true
    isDragging.value = false
    isDrag.value = false
    const sign = type === DragType.APPROVE ? 1 : -1
    Object.assign(position, {
      x: sign * Math.abs(threshold),
      y: 0,
      rotation: sign * maxRotation.value,
      type,
      delta: 1,
    })
    onComplete(type === DragType.APPROVE)
  }

  const getTransformString = computed(() => {
    if (isAnimating.value === false || position.type !== null) {
      const { x, y, rotation: rotate } = position
      return `translate3D(${x}px, ${y}px, 0) rotate(${rotate}deg)`
    }
    return ''
  })

  onUnmounted(() => {
    sourceEl.value?.removeEventListener('mousedown', handleDragStart)
    window.removeEventListener('mousemove', handleDragMove)
    window.removeEventListener('mouseup', handleDragEnd)

    sourceEl.value?.removeEventListener('touchstart', handleDragStart)
    window.removeEventListener('touchmove', handleDragMove)
    window.removeEventListener('touchend', handleDragEnd)
  })

  return {
    setupInteract,
    position,
    isDragging,
    isAnimating,
    restore,
    getTransformString,
    reject: () => complete(DragType.REJECT, -threshold.value - 1),
    approve: () => complete(DragType.APPROVE, threshold.value + 1),
  }
}
