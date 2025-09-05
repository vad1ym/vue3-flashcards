<script setup lang="ts">
import type { DragSetupParams } from './utils/useDragSetup'
import { computed, nextTick, onMounted, ref } from 'vue'
import ApproveIcon from './components/ApproveIcon.vue'
import RejectIcon from './components/RejectIcon.vue'
import { DragType, useDragSetup } from './utils/useDragSetup'

const {
  // Max rotation in degrees the card can be rotated on swipe
  // Is used for default transform string on swipe
  maxRotation = 20,

  ...params
} = defineProps<DragSetupParams & {
  maxRotation?: number
}>()

const emit = defineEmits<{
  complete: [approved: boolean]
}>()

defineSlots<{
  default: (props: { isDragging: boolean }) => any
  reject?: (props: { delta: number }) => any
  approve?: (props: { delta: number }) => any
}>()

const el = ref<HTMLElement>()

const {
  setupInteract,
  position,
  isDragging,
  restore,
  reject,
  approve,
} = useDragSetup(() => ({
  ...params,
  onComplete(approved) {
    emit('complete', approved)
  },
}))

onMounted(async () => {
  await nextTick()
  el.value && setupInteract(el.value)
})

const getTransformString = computed(() => {
  const { x, y, delta } = position
  return `translate3D(${x}px, ${y}px, 0) rotate(${delta * maxRotation}deg)`
})

defineExpose({
  reject,
  restore,
  approve,
})
</script>

<template>
  <div
    ref="el"
    class="flash-card"
    :class="{ 'flash-card--dragging': isDragging }"
    :style="{ transform: getTransformString }"
  >
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
</template>

<style scoped>
.flash-card {
  width: 100%;
  border-radius: 8px;
  transform-origin: 50%, 100%;
  will-change: transform, opacity;
  position: relative;
  touch-action: pan-x pan-y;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000px;
  perspective: 1000px;
}

.flash-card:not(.flash-card--dragging) {
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.flash-card__indicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
