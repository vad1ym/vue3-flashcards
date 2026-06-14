<script setup lang="ts">
import type { AnimationKeyframes } from './utils/animationKeyframes'
import type { DragPosition, DragSetupParams } from './utils/useDragSetup'
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import ApproveIcon from './components/icons/ApproveIcon.vue'
import RejectIcon from './components/icons/RejectIcon.vue'
import { defaultAnimationKeyframes, restFrame } from './utils/animationKeyframes'
import { SwipeAction, useDragSetup } from './utils/useDragSetup'
import { useReducedMotion } from './utils/useReducedMotion'

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

  // In-flight animation descriptor for THIS card (a "flight"). Internal wiring,
  // set by FlashCards from the deck state — not a user-facing prop.
  flight?: {
    type: SwipeAction
    isRestoring: boolean
    initialPosition?: DragPosition
  }

  // Fly-out / restore animation config. All fields optional.
  // - `keyframes` describes how the card flies OUT, from center: the off-screen
  //   end frame (or several for a multi-step exit). Receives (type, direction,
  //   maxRotation). The library builds the rest: it starts the swipe at the
  //   drag-release point and plays this REVERSED for restore. Defaults to
  //   `defaultAnimationKeyframes`.
  // - `duration` in ms (default 400). `easing` is any CSS easing string.
  animation?: {
    keyframes?: AnimationKeyframes
    duration?: number
    easing?: string
  }
}

const {
  maxRotation = 0,
  transformStyle,
  flight,
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
// Resolved fly-out / restore animation settings. The grouped `animation` prop
// is optional and each field falls back to a default.
const animationKeyframes = animation?.keyframes ?? defaultAnimationKeyframes
const animationEasing = animation?.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)'

// When the user prefers reduced motion, fly-out / restore animations collapse to
// a near-instant snap (1ms, not 0, so WAAPI still fires `finished`). The skip
// "wave" shimmer is suppressed entirely via this flag in the template.
const prefersReducedMotion = useReducedMotion()
const baseAnimationDuration = animation?.duration ?? 400
const animationDuration = computed(() => (prefersReducedMotion.value ? 1 : baseAnimationDuration))

// Current card element ref
const el = useTemplateRef('flash-card')

const {
  position,
  isDragging,
  setupInteract,
  cleanupInteract,
  getDominantAxis,
  peek,
} = useDragSetup(el, () => ({
  ...otherProps,
  direction,
  // `flight.initialPosition` is the drag-release point; the rest of `flight`
  // (type/isRestoring) is ignored by useDragSetup.
  ...flight,
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
    // Snapshot the release position — `position` is reactive and keeps mutating
    // (and resets to 0), so passing it by reference would lose the release point
    // by the time the swipe animation reads it.
    emit('complete', action, { ...position })
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

// -------------------------------------------------------------------------
// Fly-out / restore animation via the Web Animations API.
//
// One system, on the REAL element: no DOM clone, no `.ghost`, no `animationend`
// plumbing, no object-identity watch. When the `animation` prop appears we run
// `el.animate(keyframesFor(flight))` and emit `animationend` from the returned
// `.finished` promise. Multiple cards animate independently because each
// FlashCard owns its own running animation — the "last animation vanishes"
// regression is structurally impossible.
// -------------------------------------------------------------------------
let currentAnim: Animation | null = null
// The flight object we've already started animating, tracked by identity so the
// mount hook and the watcher don't double-run the same flight.
let animatedFlight: FlashCardProps['flight'] | null = null

function cancelAnim() {
  currentAnim?.cancel()
  currentAnim = null
}

function runAnimation(flight: NonNullable<FlashCardProps['flight']>) {
  if (!el.value)
    return

  // A fresh flight supersedes any in-flight one on THIS card.
  cancelAnim()
  animatedFlight = flight

  // The callback describes ONLY the fly-out, from center: a single off-screen
  // end frame (or several for a multi-step exit). We build the full keyframe set
  // around it.
  const out = animationKeyframes({
    type: flight.type,
    direction: direction || [],
    maxRotation,
  })
  const outFrames = Array.isArray(out) ? out : [out]

  let keyframes: Keyframe[]
  if (flight.isRestoring) {
    // Restore = the fly-out reversed, ending at center. The card starts where it
    // visually is (off-screen, the fly-out's last frame) and animates back in.
    keyframes = [...outFrames].reverse()
    keyframes.push({ ...restFrame })
  }
  else {
    // Swipe out: start where the card is, then run the fly-out frames. For a
    // manual swipe that start is the drag-release point so the card continues
    // from the finger instead of snapping to center; otherwise it's center.
    // The card IS fully visible at the start (opacity 1) — we must NOT inherit
    // the end frame's opacity (0), or the swipe-out looks like it just vanishes.
    const release = flight.initialPosition
    const start: Keyframe = release && (release.x !== 0 || release.y !== 0)
      ? { transform: `translate(${release.x}px, ${release.y}px)`, opacity: 1 }
      : { ...restFrame }
    keyframes = [start, ...outFrames]
  }

  const anim = el.value.animate(keyframes, {
    duration: animationDuration.value,
    easing: animationEasing,
    fill: 'forwards',
  })
  currentAnim = anim

  anim.finished
    .then(() => {
      // Ignore if a newer flight replaced us while we were running.
      if (currentAnim !== anim)
        return
      currentAnim = null

      // A RESTORED card keeps the same vnode key, so it's the same element and
      // becomes draggable again. Its `fill: 'forwards'` would keep overriding
      // the inline `translate3D` (the drag position), freezing the card in place
      // — only the inner rotation child (never touched by WAAPI) would still
      // move. The restore's final frame IS center (== the inline rest state), so
      // cancelling the fill here is visually seamless and hands control back to
      // the drag. Swipe-outs are NOT cancelled: their fill must hold the card
      // off-screen until the parent commits/removes it.
      if (flight.isRestoring)
        anim.cancel()

      emit('animationend')
    })
    // `.cancel()` rejects `.finished` with an AbortError — expected, swallow it.
    .catch(() => {})
}

/**
 * Start (or cancel) the animation to match the current `flight` prop. Safe to
 * call from both the watcher and `onMounted`: it no-ops if the current flight is
 * already running, so a card that mounts with a flight ALREADY set (a restored
 * card is a fresh DOM node) still animates — the immediate watcher fires before
 * `el` exists, so the mount hook is what actually kicks it off.
 */
function syncAnimation() {
  if (flight?.type) {
    if (flight !== animatedFlight)
      runAnimation(flight)
  }
  else {
    animatedFlight = null
    cancelAnim()
  }
}

// Drive the animation imperatively whenever a flight starts or changes.
watch(() => flight, syncAnimation, { flush: 'post' })

onMounted(() => {
  if (el.value?.offsetHeight)
    emit('mounted', el.value.offsetHeight)

  // A card may mount with a flight already set (e.g. a restored card is a fresh
  // node). `el` now exists, so kick off whatever the watcher couldn't.
  syncAnimation()
})

onBeforeUnmount(() => {
  cancelAnim()
})

// Skip's signature "wave" shimmer is a decorative pseudo-element sweep, NOT a
// card transform — it stays in CSS (independent of the WAAPI fly-out) and is
// gated by this flag while a skip flight is active.
const isSkipping = computed(() => flight?.type === SwipeAction.SKIP && !prefersReducedMotion.value)
const isSkipRestoring = computed(() => isSkipping.value && !!flight?.isRestoring)

defineExpose({
  position,
  peek,
})
</script>

<template>
  <div
    ref="flash-card"
    class="flash-card"
    :class="{
      'flash-card--dragging': isDragging,
      'flash-card--drag-disabled': otherProps.disableDrag,
    }"
    :style="{ transform: `translate3D(${position.x}px, ${position.y}px, 0)` }"
  >
    <div class="flash-card__animation-wrapper">
      <div
        class="flash-card__transform"
        :class="{
          'flash-card__transform--skip': isSkipping && !isSkipRestoring,
          'flash-card__transform--skip-restore': isSkipRestoring,
        }"
        :style="getTransformStyle(position)"
      >
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

/*
 * Card fly-out / restore animations are no longer CSS keyframes — they are
 * driven by the Web Animations API (`el.animate(...)`) on the real element. See
 * `animationKeyframes.ts` for the default keyframe set and the
 * `animation.keyframes` prop to override it.
 *
 * The ONLY CSS animation left is skip's decorative "wave" shimmer below: a
 * pseudo-element light sweep that is NOT a card transform, so it stays in CSS
 * and runs alongside the WAAPI opacity fade without reintroducing two transform
 * systems.
 */
.flash-card__transform--skip,
.flash-card__transform--skip-restore {
  overflow: hidden;
}

.flash-card__transform--skip::before,
.flash-card__transform--skip-restore::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: -100%;
  z-index: 1;
  border-radius: 8px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
}

.flash-card__transform--skip::before {
  animation: flash-card-skip-wave 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.flash-card__transform--skip-restore::before {
  animation: flash-card-skip-wave 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards;
}

@keyframes flash-card-skip-wave {
  to {
    left: 100%;
  }
}
</style>
