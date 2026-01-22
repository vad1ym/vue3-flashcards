<script setup lang="ts">
import type { DragPosition, DragSetupParams } from './utils/useDragSetup'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import ApproveIcon from './components/icons/ApproveIcon.vue'
import RejectIcon from './components/icons/RejectIcon.vue'
import { SwipeAction, useDragSetup } from './utils/useDragSetup'

export interface FlashCardProps extends DragSetupParams {
  // Completely disable dragging feature
  disableDrag?: boolean

  // Max rotation in degrees the card can be rotated on swipe
  // Is used for default transform string on swipe
  maxRotation?: number

  // Function that returns transform string based on drag position
  // By default slightly rotate the card to the direction of the swipe
  // Default value: `transform: rotate(${position.delta * maxRotation}deg)`
  transformStyle?: (position: DragPosition) => string

  // Animation for card transitions
  animation?: {
    type: string
    isRestoring: boolean
    initialPosition?: DragPosition
  }
}

const {
  maxRotation = 0,
  transformStyle,
  animation,
  direction = ['left', 'right'], // Default to horizontal
  ...otherProps
} = defineProps<FlashCardProps>()

const emit = defineEmits<{
  /**
   * Event fired when card is swiped to the end and passed result
   */
  complete: [action: SwipeAction, position: DragPosition]

  /**
   * Event fired when card is mounted, passed element height
   */
  mounted: [height: number]

  /**
   * Event fired when animation ends
   */
  animationend: []

  /**
   * Event fired when drag starts
   */
  dragstart: []

  /**
   * Event fired during dragging movement
   */
  dragmove: [type: SwipeAction | null, delta: number]

  /**
   * Event fired when drag ends
   */
  dragend: []
}>()

defineSlots<{
  default: (props: { isDragging: boolean, delta: number }) => any

  // Directional slots
  top?: (props: { delta: number }) => any
  left?: (props: { delta: number }) => any
  right?: (props: { delta: number }) => any
  bottom?: (props: { delta: number }) => any
}>()

// Current card element ref
const el = useTemplateRef('flash-card')

const {
  position,
  isDragging,
  setupInteract,
  cleanupInteract,
  getDominantAxis,
} = useDragSetup(el, () => ({
  ...otherProps,
  direction,
  ...animation,
  onDragStart() {
    emit('dragstart')
  },
  onDragMove(type, delta) {
    emit('dragmove', type, delta)
  },
  onDragEnd() {
    emit('dragend')
  },
  onDragComplete(action) {
    emit('complete', action, position)
  },
}))

// Apply custom transform style or default
function getTransformStyle(position: DragPosition): string | null {
  if (transformStyle)
    return transformStyle(position)

  const { x, y, delta } = position
  const absX = Math.abs(x)
  const absY = Math.abs(y)

  if (absX === 0 && absY === 0)
    return `transform: rotate(0deg)`

  const enabled = direction || []
  const axis = getDominantAxis(absX, absY, enabled)

  const hasH = enabled.includes('left') || enabled.includes('right')
  const hasV = enabled.includes('top') || enabled.includes('bottom')

  const dirH = x > 0 ? 'right' : 'left'
  const dirV = y > 0 ? 'bottom' : 'top'

  const rotate = () => `transform: rotate(${delta * maxRotation}deg)`
  const scale = () => `transform: scale(${1 - Math.abs(delta) / 5})`

  // Bidirectional
  if (hasH && hasV) {
    if (axis === 'horizontal' && enabled.includes(dirH))
      return rotate()
    if (axis === 'vertical' && enabled.includes(dirV))
      return scale()
    return `transform: rotate(0deg)`
  }

  // Horizontal only
  if (hasH)
    return rotate()

  // Vertical only
  return scale()
}

// Watch for disableDrag prop changes to resubscribe/unsubscribe
watch(() => otherProps.disableDrag, () => {
  cleanupInteract()
  setupInteract()
})

// Animation classes computed
const animationClasses = computed(() => ({
  [`flash-card-animation--${animation?.type}`]: !!animation?.type,
  [`flash-card-animation--${animation?.type}-restore`]: animation?.isRestoring,
}))

// Simple ghost animation state
const isGhostAnimating = ref(false)
let currentGhost: HTMLElement | null = null

// Ghost management
function cleanupGhost() {
  currentGhost?.remove()
  currentGhost = null
  isGhostAnimating.value = false
}

function triggerGhostAnimation() {
  if (!animation?.type || !el.value)
    return

  cleanupGhost()

  // Create ghost
  const wrapper = el.value.closest('.flashcards__card-wrapper') as HTMLElement
  currentGhost = wrapper.cloneNode(true) as HTMLElement
  currentGhost.classList.add('flashcards__ghost')

  const ghostAnimationWrapper = currentGhost.querySelector('.flash-card__animation-wrapper') as HTMLElement

  el.value.closest('.flashcards')?.appendChild(currentGhost)
  isGhostAnimating.value = true

  // Handle animation end
  currentGhost.addEventListener('animationend', (e: AnimationEvent) => {
    if (e.target === ghostAnimationWrapper) {
      nextTick(() => {
        cleanupGhost()
        emit('animationend')
      })
    }
  })
}

// Single watcher for animation changes
watch(() => animation, (newAnimation, oldAnimation) => {
  if (!el.value)
    return

  // Cleanup if animation changed to a new one while old is still running
  if (oldAnimation && newAnimation && oldAnimation !== newAnimation) {
    cleanupGhost()
  }

  // Trigger animation if we have a valid animation type
  if (newAnimation?.type) {
    nextTick(() => triggerGhostAnimation())
  }
}, { immediate: true })

onMounted(() => {
  if (el.value?.offsetHeight) {
    emit('mounted', el.value.offsetHeight)

    // Check if we need to trigger animation after mount
    if (animation?.type && !isGhostAnimating.value) {
      triggerGhostAnimation()
    }
  }
})

onBeforeUnmount(() => {
  cleanupGhost()
})

defineExpose({
  position,
})
</script>

<template>
  <div
    ref="flash-card"
    class="flash-card"
    :class="{
      'flash-card--dragging': isDragging,
      'flash-card--drag-disabled': otherProps.disableDrag,
      'flash-card--hidden': isGhostAnimating,
    }"
    :style="{ transform: `translate3D(${position.x}px, ${position.y}px, 0)` }"
  >
    <div
      class="flash-card__animation-wrapper"
      :class="animationClasses"
    >
      <div class="flash-card__transform" :style="getTransformStyle(position)">
        <slot :is-dragging="isDragging" :delta="position.delta" />

        <!-- Directional slots -->
        <div v-show="position.type === SwipeAction.TOP && direction?.includes('top')">
          <slot name="top" :delta="position.delta">
            <ApproveIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
          </slot>
        </div>

        <div v-show="position.type === SwipeAction.LEFT && direction?.includes('left')">
          <slot name="left" :delta="position.delta">
            <RejectIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
          </slot>
        </div>

        <div v-show="position.type === SwipeAction.RIGHT && direction?.includes('right')">
          <slot name="right" :delta="position.delta">
            <ApproveIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
          </slot>
        </div>

        <div v-show="position.type === SwipeAction.BOTTOM && direction?.includes('bottom')">
          <slot name="bottom" :delta="position.delta">
            <RejectIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flash-card {
  width: 100%;
  border-radius: 8px;
  position: relative;
  will-change: transform;
  overscroll-behavior: none;
}

.flash-card:not(.flash-card--drag-disabled) {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.flash-card__transform {
  touch-action: inherit;
  position: relative;
  border-radius: 8px;
}

.flash-card:not(.flash-card--dragging),
.flash-card:not(.flash-card--dragging) .flash-card__transform {
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.flash-card__indicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.flash-card--hidden {
  opacity: 0 !important;
  transition: none !important;
  pointer-events: none !important;
}

/* Disable all animations for hidden elements - they will be handled by ghost */
.flash-card--hidden .flash-card__animation-wrapper {
  animation: none !important;
}

/* Base animations */
.flash-card-animation--skip { animation: skip-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--skip-restore { animation: restore-skip-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

/* Directional animations */
.flash-card-animation--top { animation: swipe-top 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--left { animation: swipe-left 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--right { animation: swipe-right 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--bottom { animation: swipe-bottom 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

/* Directional restore animations */
.flash-card-animation--top-restore { animation: restore-top 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--left-restore { animation: restore-left 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--right-restore { animation: restore-right 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--bottom-restore { animation: restore-bottom 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

/* Keyframes */
@keyframes skip-horizontal {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 0;
  }
}

.flash-card-animation--skip .flash-card__transform {
  overflow: hidden;
}

/* Skip wave effect - unified for both directions */
.flash-card-animation--skip .flash-card__transform::before,
.flash-card-animation--skip-restore .flash-card__transform::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%);
  z-index: 1;
  border-radius: 8px;
  top: 0;
  left: -100%;
}

/* Wave animation - same for both horizontal and vertical */
.flash-card-animation--skip .flash-card__transform::before {
  animation: skip-wave 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
}
.flash-card-animation--skip-restore .flash-card__transform::before {
  animation: skip-wave 0.4s cubic-bezier(0.4,0,0.2,1) reverse forwards;
}
@keyframes skip-wave { to { left: 100%; } }
@keyframes skip-wave-vertical { to { top: 100%; } }
@keyframes restore-skip-horizontal {
  0% { transform: translateX(0); opacity: 0; }
  50% { transform: translateX(0); opacity: 0.3; }
  100% { transform: translateX(0); opacity: 1; }
}

/* Vertical keyframes */
@keyframes skip-vertical {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 0;
  }
}
@keyframes restore-skip-vertical {
  0% { transform: translateY(0); opacity: 0; }
  50% { transform: translateY(0); opacity: 0.3; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Directional keyframes */
@keyframes swipe-right { to {transform:translateX(320px) rotate(15deg);opacity:0;} }
@keyframes swipe-left { to {transform:translateX(-320px) rotate(-15deg);opacity:0;} }
@keyframes swipe-top { to {transform:translateY(-320px) scale(0.8);opacity:0;} }
@keyframes swipe-bottom { to {transform:translateY(320px) scale(0.8);opacity:0;} }

@keyframes restore-right { from {transform:translateX(320px) rotate(15deg);opacity:0;} to {transform:translateX(0) rotate(0deg);opacity:1;} }
@keyframes restore-left { from {transform:translateX(-320px) rotate(-15deg);opacity:0;} to {transform:translateX(0) rotate(0deg);opacity:1;} }
@keyframes restore-top { from {transform:translateY(-320px) scale(0.8);opacity:0;} to {transform:translateY(0) scale(1);opacity:1;} }
@keyframes restore-bottom { from {transform:translateY(320px) scale(0.8);opacity:0;} to {transform:translateY(0) scale(1);opacity:1;} }
</style>
