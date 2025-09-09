<script setup lang="ts">
import type { DragPosition, DragSetupParams } from './utils/useDragSetup'
import { onMounted, useTemplateRef, watch } from 'vue'
import ApproveIcon from './components/icons/ApproveIcon.vue'
import RejectIcon from './components/icons/RejectIcon.vue'
import { config } from './config'
import { DragType, useDragSetup } from './utils/useDragSetup'

export interface FlashCardProps extends DragSetupParams {
  // Transition config managed by parent stack due to virtualization
  transitionName?: string

  // System params
  transitionShow?: boolean
  transitionType?: DragType | null

  // Completely disable dragging feature
  disableDrag?: boolean

  // Max rotation in degrees the card can be rotated on swipe
  // Is used for default transform string on swipe
  maxRotation?: number

  // Function that returns transform string based on drag position
  // By default slightly rotate the card to the direction of the swipe
  // Default value: `transform: rotate(${position.delta * maxRotation}deg)`
  transformStyle?: (position: DragPosition) => string
}

const {
  maxRotation: _maxRotation = config.defaultMaxRotation,

  transformStyle = (position: DragPosition) =>
    `transform: rotate(${position.delta * config.defaultMaxRotation}deg)`,

  transitionName = config.defaultTransitionName,

  // System params
  transitionShow = false,
  transitionType = null,

  ...params
} = defineProps<FlashCardProps>()

const emit = defineEmits<{
  /**
   * Event fired when card is swiped to the end and passed result
   */
  complete: [approved: boolean]

  /**
   * Event fired when card is mounted, passed element height
   */
  mounted: [height: number]
}>()

defineSlots<{
  default: (props: { isDragging: boolean }) => any
  reject?: (props: { delta: number }) => any
  approve?: (props: { delta: number }) => any
}>()

// Current card element ref
const el = useTemplateRef('flash-card')

const {
  position,
  isDragging,
  restore,
  reject,
  approve,
  setupInteract,
  cleanupInteract,
} = useDragSetup(el, () => ({
  ...params,
  onComplete(approved) {
    emit('complete', approved)
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
  reject,
  restore,
  approve,
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
    <Transition :name="transitionName" mode="out-in">
      <div
        v-show="transitionShow"
        class="flash-card__transition"
        :class="{
          [`${transitionName}--approved`]: transitionType === DragType.APPROVE,
          [`${transitionName}--rejected`]: transitionType === DragType.REJECT,
        }"
      >
        <div class="flash-card__transform" :style="transformStyle(position)">
          <slot :is-dragging="isDragging" />

          <div v-show="position.type === DragType.REJECT">
            <slot name="reject" :delta="position.delta">
              <RejectIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
            </slot>
          </div>

          <div v-show="position.type === DragType.APPROVE">
            <slot name="approve" :delta="position.delta">
              <ApproveIcon class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }" />
            </slot>
          </div>
        </div>
      </div>
    </Transition>
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
}

.flash-card__transition,
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

.card-transition-enter-active,
.card-transition-leave-active {
  will-change: transform opacity;
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-transition-enter-from,
.card-transition-leave-to {
  opacity: 0;
}

.card-transition-enter-from.card-transition--rejected,
.card-transition-leave-to.card-transition--rejected {
  transform: translateX(-300px) rotate(-20deg);
}

.card-transition-enter-from.card-transition--approved,
.card-transition-leave-to.card-transition--approved {
  transform: translateX(300px) rotate(20deg);
}
</style>
