<script lang="ts" setup generic="T extends Record<string, unknown>">
import { computed, reactive, ref } from 'vue'
import FlashCard from './FlashCard.vue'
import FlashCardFlip from './FlashCardFlip.vue'

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
  back?: (props: { item: T }) => any
  reject?: (props: { item: T }) => any
  approve?: (props: { item: T }) => any
  actions?: (props: { restore: () => void, reject: () => void, approve: () => void, isEnd: boolean, canRestore: boolean }) => any
  empty?: () => any
}>()

const cards = ref<InstanceType<typeof FlashCard>[]>([])

interface CardState {
  approved?: boolean
  done: boolean
}

const history = reactive<Map<number, CardState>>(new Map())
const currentIndex = ref(0)

const isFirstCard = computed(() => currentIndex.value === 0)

const visibleItems = computed(() => {
  const buffer = props.virtualBuffer ?? 1
  const start = Math.max(0, currentIndex.value - 1)
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

function restore() {
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

function approve() {
  cards.value?.[currentIndex.value]?.approve()
}

function reject() {
  cards.value?.[currentIndex.value]?.reject()
}

const isEnd = computed(() => {
  return currentIndex.value >= props.items.length
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
    <div class="flashcards-container">
      <div class="empty-state">
        <slot name="empty">
          <div>
            No more cards!
          </div>
        </slot>
      </div>
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
              :ref="el => (cards[index] = el as InstanceType<typeof FlashCard>)"
              :current="index === currentIndex"
              :threshold="props.threshold"
              :max-rotation="props.maxRotation"
              @complete="setApproval(index, $event)"
            >
              <template #default="{ isDragging }">
                <FlashCardFlip :disabled="isDragging || !props.flip">
                  <template #front>
                    <slot :item="item" />
                  </template>
                  <template #back>
                    <slot name="back" :item="item" />
                  </template>
                </FlashCardFlip>
              </template>

              <template #reject>
                <slot name="reject" :item="item" />
              </template>
              <template #approve>
                <slot name="approve" :item="item" />
              </template>
            </FlashCard>
          </div>
        </div>
      </TransitionGroup>
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
.flashcards-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.empty-state {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
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
  transform: translate(-50%, -50%) translateX(-300px) rotate(-20deg) !important;
}

.list-enter-from.right.animate-card,
.list-leave-to.right.animate-card {
  transform: translate(-50%, -50%) translateX(300px) rotate(20deg) !important;
}

.list-leave-active {
  position: absolute;
}
</style>
