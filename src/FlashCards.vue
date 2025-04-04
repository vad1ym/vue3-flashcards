<script lang="ts" setup generic="T extends Record<string, unknown>">
import { computed, reactive, ref } from 'vue'
import FlashCard from './FlashCard.vue'
import FlashCardFlip from './FlashCardFlip.vue'
import { useVisibleRange } from './utils/useVisibleRange'

const props = defineProps<{
  items: T[]
  flip?: boolean
  threshold?: number
  maxRotation?: number
  virtualBuffer?: number
}>()

const emit = defineEmits<{
  approve: [item: T]
  reject: [item: T]
}>()

defineSlots<{
  default: (props: { item: T }) => any
  back: (props: { item: T }) => any
  actions: (props: { restore: () => void, reject: () => void, approve: () => void }) => any
}>()

const cards = ref<any[]>([])

interface CardState {
  approved?: boolean
  done: boolean
}

const history = reactive<Map<number, CardState>>(new Map())
const currentIndex = ref(0)

const isFirstCard = computed(() => currentIndex.value === 0)

const visibleItems = computed(() => {
  const buffer = props.virtualBuffer ?? 1
  const start = Math.max(0, currentIndex.value - 1) // Always keep previous card for restore
  const end = Math.min(props.items.length - 1, currentIndex.value + buffer)

  return Array.from({ length: end - start + 1 }, (_, i) => {
    const index = start + i
    return {
      item: props.items[index],
      index,
      state: history.get(index),
    }
  })
})

function setApproval(index: number, approved: boolean) {
  history.set(index, { approved, done: true })
  currentIndex.value++

  if (approved)
    emit('approve', props.items[index])
  else
    emit('reject', props.items[index])
}

function restoreLast() {
  if (isFirstCard.value)
    return

  const previousIndex = currentIndex.value - 1
  const previousCard = history.get(previousIndex)

  if (previousCard) {
    previousCard.done = false
    currentIndex.value = previousIndex
    cards.value?.[previousIndex]?.restore()
  }
}

function approveCurrent() {
  cards.value?.[currentIndex.value]?.approve()
}
function rejectCurrent() {
  cards.value?.[currentIndex.value]?.reject()
}

defineExpose({
  restore: restoreLast,
  approve: approveCurrent,
  reject: rejectCurrent,
})
</script>

<template>
  <div>
    <div class="flashcards-container">
      <div class="flashcards-container-height-item">
        <slot :item="({} as T)" />
      </div>
      <TransitionGroup name="list">
        <div
          v-for="{ item, index, state } in visibleItems"
          v-show="!state?.done"
          :key="index"
          class="flashcard-item"
          :class="{
            'left': state?.approved === false,
            'right': state?.approved === true,
            'animate-card': index === currentIndex || index === currentIndex - 1,
          }"
          :style="{ zIndex: props.items.length - index }"
        >
          <div class="flashcard-content">
            <FlashCard
              :ref="el => cards[index] = el"
              :current="index === currentIndex"
              #="{ isDragging }"
              :threshold="props.threshold"
              :max-rotation="props.maxRotation"
              @complete="setApproval(index, $event)"
            >
              <FlashCardFlip :disabled="isDragging || !props.flip">
                <template #front>
                  <slot :item="item" />
                </template>
                <template #back>
                  <slot name="back" :item="item" />
                </template>
              </FlashCardFlip>
            </FlashCard>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <slot name="actions" :restore="restoreLast" :reject="rejectCurrent" :approve="approveCurrent">
      <div class="flashcards-actions">
        <div class="flashcards-action" @click="restoreLast">
          Return
        </div>
        <div class="flashcards-action" @click="rejectCurrent">
          Reject
        </div>
        <div class="flashcards-action" @click="approveCurrent">
          Approve
        </div>
      </div>
    </slot>
  </div>
</template>

<style scoped>
.flashcards-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.flashcards-container-height-item {
  opacity: 0;
  pointer-events: none;
}

.flashcard-item {
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 50%;
  /* height: 95%; */
  width: 100%;
  transform: translate(-50%, -50%);
}

.flashcard-content {
  pointer-events: all;
  width: 100%;
  /* height: 100%; */
}

.list-move {
  transition: none;
}

.animate-card.list-move,
.animate-card.list-enter-active,
.animate-card.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-enter-from.left.animate-card,
.list-leave-to.left.animate-card {
  transform: translateX(-300px) !important;
}

.list-enter-from.right.animate-card,
.list-leave-to.right.animate-card {
  transform: translateX(300px) !important;
}

.list-leave-active {
  position: absolute;
}

.flashcards-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
}

.flashcards-action {
  flex: 1;
  cursor: pointer;

  &:nth-child(2) {
    text-align: center;
  }

  &:nth-child(3) {
    text-align: right;
  }
}
</style>
