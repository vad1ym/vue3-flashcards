<script setup lang="ts">
import type { DragPosition, DragSetupParams } from './utils/useDragSetup'
import { computed, useTemplateRef } from 'vue'
import ApproveIcon from './components/ApproveIcon.vue'
import RejectIcon from './components/RejectIcon.vue'
import { DragType, useDragSetup } from './utils/useDragSetup'

export interface FlashCardProps extends DragSetupParams {
  // Max rotation in degrees the card can be rotated on swipe
  // Is used for default transform string on swipe
  maxRotation?: number

  // Function that returns transform string based on drag position
  // By default slightly rotate the card to the direction of the swipe
  // Default value: `transform: rotate(${position.delta * maxRotation}deg)`
  transformStyle?: (position: DragPosition) => string
}

const {
  maxRotation = 20,
  transformStyle,
  ...params
} = defineProps<FlashCardProps>()

const emit = defineEmits<{
  complete: [approved: boolean]
}>()

defineSlots<{
  default: (props: { isDragging: boolean }) => any
  reject?: (props: { delta: number }) => any
  approve?: (props: { delta: number }) => any
}>()

const el = useTemplateRef('flash-card')

const {
  position,
  isDragging,
  restore,
  reject,
  approve,
} = useDragSetup(el, () => ({
  ...params,
  onComplete(approved) {
    emit('complete', approved)
  },
}))

const getTransformStyle = computed(() => {
  if (!transformStyle) {
    return `transform: rotate(${position.delta * maxRotation}deg)`
  }
  return transformStyle(position)
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
    :class="{ 'flash-card--dragging': isDragging }"
    :style="{ transform: `translate3D(${position.x}px, ${position.y}px, 0)` }"
  >
    <div class="flash-card__transform" :style="getTransformStyle">
      <slot :is-dragging="isDragging" />

      <slot name="reject" :delta="position.delta">
        <div v-show="position.type === DragType.REJECT" class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }">
          <RejectIcon />
        </div>
      </slot>

      <slot name="approve" :delta="position.delta">
        <div v-show="position.type === DragType.APPROVE" class="flash-card__indicator" :style="{ opacity: Math.abs(position.delta) }">
          <ApproveIcon />
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.flash-card {
  width: 100%;
  border-radius: 8px;
  transform-origin: 50%, 100%;
  position: relative;
  touch-action: pan-x pan-y;
}

.flash-card__transform {
  will-change: transform;
  width: 100%;
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
}
</style>
