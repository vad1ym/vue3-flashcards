<script setup lang="ts">
import type { DragPosition, DragSetupParams } from './utils/useDragSetup'
import { onMounted, useTemplateRef, watch } from 'vue'
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
  onDragComplete(action) {
    emit('complete', action, position)
  },
}))

// Watch for disableDrag prop changes to resubscribe/unsubscribe
watch(() => params.disableDrag, () => {
  cleanupInteract()
  setupInteract()
})

onMounted(() => {
  if (el.value?.offsetHeight) {
    emit('mounted', el.value?.offsetHeight)
  }
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
    }"
    :style="{ transform: `translate3D(${position.x}px, ${position.y}px, 0)` }"
  >
    <div
      class="flash-card__animation-wrapper"
      :class="{
        [`flash-card-animation--${animation?.type}`]: animation?.type,
        [`flash-card-animation--${animation?.type}-restore`]: animation?.isRestoring,
      }"
      @animationend="emit('animationend')"
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

/* Default animations */
.flash-card-animation--approve { animation: approve 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--reject { animation: reject 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--approve-restore { animation: restore-approve 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
.flash-card-animation--reject-restore { animation: restore-reject 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

@keyframes approve { 0%{opacity:1;} 100%{transform:translateX(320px) rotate(15deg);opacity:0;} }
@keyframes reject { 0%{opacity:1;} 100%{transform:translateX(-320px) rotate(-15deg);opacity:0;} }
@keyframes restore-approve { 0%{transform:translateX(320px) rotate(15deg);opacity:0;} 100%{transform:translateX(0) rotate(0deg);opacity:1;} }
@keyframes restore-reject { 0%{transform:translateX(-320px) rotate(-15deg);opacity:0;} 100%{transform:translateX(0) rotate(0deg);opacity:1;} }
</style>
