<script lang="ts" setup generic="T extends Record<string, unknown>">
import { computed, reactive, ref } from 'vue'
import FlashCard from './FlashCard.vue'

const {
  items = [],
  threshold,
  dragThreshold,
  maxRotation,
  virtualBuffer = 2,
  maxDraggingX,
  maxDraggingY,
  infinite = false,
} = defineProps<{
  items?: T[]
  threshold?: number
  dragThreshold?: number
  maxRotation?: number
  virtualBuffer?: number
  maxDraggingX?: number | null
  maxDraggingY?: number | null
  infinite?: boolean
}>()

const emit = defineEmits<{
  approve: [item: T]
  reject: [item: T]
}>()

defineSlots<{
  default: (props: { item: T }) => any
  reject?: (props: { item: T, delta: number }) => any
  approve?: (props: { item: T, delta: number }) => any
  actions?: (props: { restore: (animated?: boolean) => void, reject: () => void, approve: () => void, isEnd: boolean, canRestore: boolean }) => any
  empty?: () => any
}>()

const cardRefs = ref<Map<number, InstanceType<typeof FlashCard>>>(new Map())

interface CardState {
  approved?: boolean
  done: boolean
}

const history = reactive<Map<number, CardState>>(new Map())
const currentIndex = ref(0)

function getItemAtIndex(index: number) {
  if (infinite) {
    return items[index % items.length]
  }
  return items[index]
}

const isFirstCard = computed(() => currentIndex.value === 0)

const visibleItems = computed(() => {
  const start = Math.max(0, currentIndex.value - 1)
  const end = infinite
    ? currentIndex.value + virtualBuffer
    : Math.min(items.length - 1, currentIndex.value + virtualBuffer)

  return Array.from({ length: end - start + 1 }, (_, i) => {
    const index = start + i
    return {
      item: getItemAtIndex(index),
      index,
      state: history.get(index),
    }
  })
})

function setApproval(index: number, approved: boolean) {
  history.set(index, { approved, done: true })
  currentIndex.value++

  // Get the original item for emit
  const originalItem = getItemAtIndex(index)
  if (approved)
    emit('approve', originalItem)
  else
    emit('reject', originalItem)
}

function restore() {
  if (isFirstCard.value)
    return

  const previousIndex = currentIndex.value - 1
  const previousCard = history.get(previousIndex)

  if (previousCard) {
    previousCard.done = false
    currentIndex.value = previousIndex
    cardRefs.value.get(currentIndex.value)?.restore()
  }
}

function approve() {
  cardRefs.value.get(currentIndex.value)?.approve()
}

function reject() {
  cardRefs.value.get(currentIndex.value)?.reject()
}

const isEnd = computed(() => {
  return currentIndex.value >= items.length
})

const canRestore = computed(() => !isFirstCard.value)

defineExpose({
  restore,
  approve,
  reject,
  canRestore,
  isEnd,
})
</script>

<template>
  <div>
    <div class="flashcards">
      <div class="flashcards__empty-state" :style="{ zIndex: -items.length - 1 }">
        <slot name="empty">
          <div>
            No more cards!
          </div>
        </slot>
      </div>

      <!-- This invisible card is needed to keep the height of the cards -->
      <div class="flashcards__height-reference">
        <slot :item="({} as T)" />
      </div>

      <template v-for="{ item, index, state } in visibleItems" :key="index">
        <Transition name="card-transition" mode="out-in">
          <div
            v-show="!state?.done"
            class="flashcards__card-wrapper"
            :class="{
              'flashcards__card-wrapper--rejected': state?.approved === false,
              'flashcards__card-wrapper--approved': state?.approved === true,
              'flashcards__card-wrapper--current': index === currentIndex,
            }"
            :style="{ zIndex: currentIndex - index }"
          >
            <FlashCard
              :ref="el => el && cardRefs.set(index, el as InstanceType<typeof FlashCard>)"
              :threshold="threshold"
              :drag-threshold="dragThreshold"
              :max-rotation="maxRotation"
              :max-dragging-x="maxDraggingX"
              :max-dragging-y="maxDraggingY"
              class="flashcards__card"
              :class="{ 'flashcards__card--interactive': index === currentIndex }"
              @complete="setApproval(index, $event)"
            >
              <template #default>
                <slot :item="item" />
              </template>

              <template #reject="{ delta }">
                <slot name="reject" :item="item" :delta="delta" />
              </template>
              <template #approve="{ delta }">
                <slot name="approve" :item="item" :delta="delta" />
              </template>
            </FlashCard>
          </div>
        </Transition>
      </template>
    </div>

    <slot
      name="actions"
      :restore="restore"
      :reject="reject"
      :approve="approve"
      :is-end="isEnd"
      :can-restore="canRestore"
    />
  </div>
</template>

<style scoped>
.flashcards {
  position: relative;
  width: 100%;
  height: 100%;
  isolation: isolate;
}

.flashcards__empty-state {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
}

.flashcards__height-reference {
  opacity: 0;
  pointer-events: none;
}

.flashcards__card-wrapper {
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  transform: translate3d(-50%, -50%, 0);
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.3s ease;
  will-change: transform, opacity;
}

.flashcards__card {
  pointer-events: none;
}

.flashcards__card-wrapper--current .flashcards__card {
  pointer-events: all;
}

.card-transition-enter-active,
.card-transition-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-transition-enter-from,
.card-transition-leave-to {
  opacity: 0;
}

.card-transition-enter-from.flashcards__card-wrapper--rejected,
.card-transition-leave-to.flashcards__card-wrapper--rejected {
  transform: translate(-50%, -50%) translateX(-300px) rotate(-20deg);
}

.card-transition-enter-from.flashcards__card-wrapper--approved,
.card-transition-leave-to.flashcards__card-wrapper--approved {
  transform: translate(-50%, -50%) translateX(300px) rotate(20deg);
}
</style>
