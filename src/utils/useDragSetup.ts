import interact from '@interactjs/interact'
import { computed, reactive, ref } from 'vue'
import '@interactjs/actions/drag'
import '@interactjs/inertia'
import '@interactjs/modifiers'
import '@interactjs/auto-start'

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
    threshold: options.threshold ?? window.innerWidth / 3,
    onDragStart: options.onDragStart || (() => {}),
    onDragMove: options.onDragMove || (() => {}),
    onDragEnd: options.onDragEnd || (() => {}),
    onComplete: options.onComplete || (() => {}),
  }
}

export function useDragSetup(options: DragSetupOptions) {
  const { maxRotation, threshold, onDragStart, onDragMove, onDragEnd, onComplete } = parseOptions(options)

  const isDragging = ref(false)
  const isAnimating = ref(false)

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

  function setupInteract(el: HTMLElement) {
    restore()

    interact(el).draggable({
      inertia: false,
      onstart() {
        isAnimating.value = false
        isDragging.value = true
        onDragStart()
      },
      onmove(event) {
        event.preventDefault()
        const x = (position.x || 0) + event.dx
        const y = (position.y || 0) + event.dy

        let rotate = maxRotation * (x / threshold)

        if (rotate > maxRotation) {
          rotate = maxRotation
        }
        else if (rotate < -maxRotation) {
          rotate = -maxRotation
        }

        position.x = x
        position.y = y
        position.rotation = rotate

        if (rotate > 0) {
          position.type = DragType.APPROVE
        }
        else if (rotate < 0) {
          position.type = DragType.REJECT
        }

        const opacityAmount = Math.abs(rotate) / maxRotation

        position.delta = opacityAmount
        onDragMove(position.type, opacityAmount)
      },
      onend() {
        isAnimating.value = true

        setTimeout(() => {
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
      },
    })
  }

  /**
   * Simulate rejection
   */
  function reject() {
    isAnimating.value = true
    isDragging.value = false
    Object.assign(position, {
      x: -threshold - 1, // Move past threshold to trigger rejection
      y: 0,
      rotation: -maxRotation,
      type: DragType.REJECT,
      delta: 1,
    })
    onComplete(false)
  }

  /**
   * Simulate approval
   */
  function approve() {
    isAnimating.value = true
    isDragging.value = false
    Object.assign(position, {
      x: threshold + 1,
      y: 0,
      rotation: maxRotation,
      type: DragType.APPROVE,
      delta: 1,
    })
    onComplete(true)
  }

  const getTransformString = computed(() => {
    if (isAnimating.value === false || position.type !== null) {
      const x = position.x
      const y = position.y
      const rotate = position.rotation
      return `translate3D(${x}px, ${y}px, 0) rotate(${rotate}deg)`
    }
    return ''
  })

  return {
    setupInteract,
    position,
    isDragging,
    isAnimating,
    restore,
    getTransformString,
    reject,
    approve,
  }
}
