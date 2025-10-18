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
  ...params
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
  default: (props: { isDragging: boolean }) => any
  reject?: (props: { delta: number }) => any
  approve?: (props: { delta: number }) => any
}>()

// Apply custom transform style or default
function getTransformStyle(position: DragPosition): string | null {
  if (transformStyle) {
    return transformStyle(position)
  }

  // For vertical swipe, don't rotate by default
  if (params.swipeDirection === 'vertical') {
    return `transform: scale(${1 - Math.abs(position.delta) / 5})`
  }

  // For horizontal swipe, use rotation
  return `transform: rotate(${position.delta * maxRotation}deg)`
}

// Current card element ref
const el = useTemplateRef('flash-card')

const {
  position,
  isDragging,
  setupInteract,
  cleanupInteract,
} = useDragSetup(el, () => ({
  ...params,
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

// Watch for disableDrag prop changes to resubscribe/unsubscribe
watch(() => params.disableDrag, () => {
  cleanupInteract()
  setupInteract()
})

// Animation classes computed
const animationClasses = computed(() => ({
  [`flash-card-animation--${animation?.type}`]: !!animation?.type,
  [`flash-card-animation--${animation?.type}-restore`]: animation?.isRestoring,
  [`flash-card-animation--${params.swipeDirection}`]: !!params.swipeDirection,
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

  el.value.closest('.flashcards')?.appendChild(currentGhost)
  isGhostAnimating.value = true

  // Handle animation end
  currentGhost.addEventListener('animationend', (e: AnimationEvent) => {
    if (e.target === currentGhost?.querySelector('.flash-card__animation-wrapper')) {
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
  el.value?.offsetHeight && emit('mounted', el.value.offsetHeight)
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
      'flash-card--drag-disabled': params.disableDrag,
      'flash-card--hidden': isGhostAnimating,
    }"
    :style="{ transform: `translate3D(${position.x}px, ${position.y}px, 0)` }"
  >
    <div
      class="flash-card__animation-wrapper"
      :class="animationClasses"
    >
      <div class="flash-card__transform" :style="getTransformStyle(position)">
        <slot :is-dragging="isDragging" />

        <div v-show="position.type === SwipeAction.REJECT">
          <slot name="reject" :delta="position.delta">
            <RejectIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
          </slot>
        </div>

        <div v-show="position.type === SwipeAction.APPROVE">
          <slot name="approve" :delta="position.delta">
            <ApproveIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
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

/* Base animations (horizontal by default) */
.flash-card-animation--approve { animation: approve-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--reject { animation: reject-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--approve-restore { animation: restore-approve-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--reject-restore { animation: restore-reject-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

/* Horizontal direction override */
.flash-card-animation--horizontal.flash-card-animation--approve { animation: approve-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--horizontal.flash-card-animation--reject { animation: reject-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--horizontal.flash-card-animation--approve-restore { animation: restore-approve-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--horizontal.flash-card-animation--reject-restore { animation: restore-reject-horizontal 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

/* Vertical direction override */
.flash-card-animation--vertical.flash-card-animation--approve { animation: approve-vertical 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--vertical.flash-card-animation--reject { animation: reject-vertical 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--vertical.flash-card-animation--approve-restore { animation: restore-approve-vertical 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--vertical.flash-card-animation--reject-restore { animation: restore-reject-vertical 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

/* Horizontal keyframes */
@keyframes approve-horizontal { to {transform:translateX(320px) rotate(15deg);opacity:0;} }
@keyframes reject-horizontal { to {transform:translateX(-320px) rotate(-15deg);opacity:0;} }
@keyframes restore-approve-horizontal { from {transform:translateX(320px) rotate(15deg);opacity:0;} to {transform:translateX(0) rotate(0deg);opacity:1;} }
@keyframes restore-reject-horizontal { from {transform:translateX(-320px) rotate(-15deg);opacity:0;} to {transform:translateX(0) rotate(0deg);opacity:1;} }

/* Vertical keyframes */
@keyframes approve-vertical { to {transform:translateY(-320px);opacity:0;} }
@keyframes reject-vertical { to {transform:translateY(320px);opacity:0;} }
@keyframes restore-approve-vertical { from {transform:translateY(-320px);opacity:0;} to {transform:translateY(0);opacity:1;} }
@keyframes restore-reject-vertical { from {transform:translateY(320px);opacity:0;} to {transform:translateY(0);opacity:1;} }

.flash-card--ghost {
  pointer-events: none;
  z-index: 9999;
}
</style>
