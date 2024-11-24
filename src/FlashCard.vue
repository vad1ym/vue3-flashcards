<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import ApproveIcon from './components/ApproveIcon.vue'
import RejectIcon from './components/RejectIcon.vue'
import { DragType, useDragSetup } from './utils/useDragSetup'

const props = defineProps<{
  current: boolean
  maxRotation?: number
  threshold?: number
}>()

const emit = defineEmits<{
  complete: [approved: boolean]
}>()

const el = ref<HTMLElement | null>(null)

const {
  setupInteract,
  position,
  getTransformString,
  isDragging,
  isAnimating,
  restore,
  reject,
  approve,
} = useDragSetup({
  maxRotation: props.maxRotation,
  threshold: props.threshold,
  onComplete(approved) {
    emit('complete', approved)
  },
})

onMounted(async () => {
  await nextTick()

  if (el.value) {
    setupInteract(el.value)
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
    ref="el"
    class="card"
    :class="{ animated: isAnimating, current: props.current }"
    :style="{ transform: getTransformString }"
  >
    <slot :is-dragging="isDragging" />

    <div class="indicator" :style="{ opacity: position.delta }">
      <transition name="fade" mode="out-in">
        <slot v-if="position.type === DragType.REJECT" name="reject" :delta="position.delta">
          <RejectIcon />
        </slot>

        <slot v-else-if="position.type === DragType.APPROVE" name="approve" :delta="position.delta">
          <ApproveIcon />
        </slot>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  /* height: 100%; */
  pointer-events: none;
  border-radius: 8px;
  transform-origin: 50%, 100%;
  will-change: transform, opacity;
  position: relative;
}

.card.current {
  pointer-events: auto;
}

.card.animated {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.indicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
