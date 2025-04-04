import { computed, onUnmounted, reactive, ref } from 'vue'

export enum DragType {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export interface DragSetupOptions {
  maxRotation?: number
  threshold?: number
  onDragStart?: () => void
  onDragMove?: (type: DragType | null, delta: number) => void
  onDragEnd?: () => void
  onComplete?: (approved: boolean) => void
}

export interface DragPosition {
  x: number
  y: number
  rotation: number
  delta: number
  type: DragType | null
}

function parseOptions(options: DragSetupOptions) {
  return {
    maxRotation: options.maxRotation ?? 20,
    threshold: options.threshold ?? 150,
    onDragStart: options.onDragStart || (() => {}),
    onDragMove: options.onDragMove || (() => {}),
    onDragEnd: options.onDragEnd || (() => {}),
    onComplete: options.onComplete || (() => {}),
  }
}

export function useDragSetup(options: DragSetupOptions) {
  const { maxRotation, threshold, onDragStart, onDragMove, onDragEnd, onComplete } = parseOptions(options)

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

    isDragging.value = true

    event.preventDefault()
    event.stopPropagation()

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY

    const x = clientX - startX
    const y = clientY - startY

    let rotate = maxRotation * (x / threshold)
    rotate = Math.max(-maxRotation, Math.min(maxRotation, rotate))

    position.x = x
    position.y = y
    position.rotation = rotate
    position.type = rotate > 0 ? DragType.APPROVE : rotate < 0 ? DragType.REJECT : null

    const opacityAmount = Math.abs(rotate) / maxRotation
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

    if (position.x > threshold) {
      onComplete(true)
      position.delta = 1
    }
    else if (position.x < -threshold) {
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

    // Mouse events
    el.addEventListener('mousedown', handleDragStart)
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)

    // Touch events
    el.addEventListener('touchstart', handleDragStart)
    window.addEventListener('touchmove', handleDragMove)
    window.addEventListener('touchend', handleDragEnd)
  }

  function complete(type: DragType, threshold: number) {
    isAnimating.value = true
    isDragging.value = false
    isDrag.value = false
    const sign = type === DragType.APPROVE ? 1 : -1
    Object.assign(position, {
      x: sign * Math.abs(threshold),
      y: 0,
      rotation: sign * maxRotation,
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
    reject: () => complete(DragType.REJECT, -threshold - 1),
    approve: () => complete(DragType.APPROVE, threshold + 1),
  }
}
