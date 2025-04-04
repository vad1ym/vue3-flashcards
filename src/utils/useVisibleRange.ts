import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface VirtualListRange {
  start: number
  end: number
  items: number[]
}

export function useVisibleRange(
  currentIndex: MaybeRefOrGetter<number>,
  totalItems: MaybeRefOrGetter<number>,
  buffer: MaybeRefOrGetter<number>,
): ComputedRef<VirtualListRange> {
  const _currentIndex = computed(() => toValue(currentIndex))
  const _totalItems = computed(() => toValue(totalItems))
  const _buffer = computed(() => toValue(buffer))

  const start = computed(() => Math.max(0, _currentIndex.value - _buffer.value))
  const end = computed(() => Math.min(_totalItems.value - 1, _currentIndex.value + _buffer.value))

  return computed(() => ({
    start: start.value,
    end: end.value,
    items: Array.from({ length: end.value - start.value + 1 }, (_, i) => start.value + i),
  }))
}
