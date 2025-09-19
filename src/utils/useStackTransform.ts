import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export const StackDirection = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
} as const

export type StackDirection = typeof StackDirection[keyof typeof StackDirection]

export interface StackTransformOptions {
  stack: number
  stackOffset: number
  stackScale: number
  stackDirection: StackDirection
  renderLimit: number
}

export function useStackTransform(_options: MaybeRefOrGetter<StackTransformOptions>) {
  const options = computed(() => toValue(_options))

  const getCardStyle = (level: number): string => {
    const { stack, stackOffset, stackScale } = options.value

    if (!stack) {
      return ''
    }

    // Only cards with index lower than stack value should be stacked
    // First card is level 0 so it should be considered stacked, but have no scaling of offset
    const isStacked = level <= stack

    // All not stacked should be scaled down to be not visible and appear with transition
    const offset = isStacked
      ? level * stackOffset
      : (level - 1) * stackOffset

    const scale = 1 - level * stackScale

    let transform = 'transform: translate3D(0, 0, 0) scale(1)'

    switch (options.value.stackDirection) {
      case StackDirection.TOP:
        transform = `transform: translate3D(0, -${offset}px, 0) scale(${scale})`
        break
      case StackDirection.BOTTOM:
        transform = `transform: translate3D(0, ${offset}px, 0) scale(${scale})`
        break
      case StackDirection.LEFT:
        transform = `transform: translate3D(-${offset}px, 0, 0) scale(${scale})`
        break
      case StackDirection.RIGHT:
        transform = `transform: translate3D(${offset}px, 0, 0) scale(${scale})`
        break
    }

    return `${transform}; opacity: ${isStacked ? 1 : 0};`
  }

  return {
    getCardStyle,
  }
}
