import type { MaybeRefOrGetter } from 'vue'
import { computed, toRef } from 'vue'

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
  currentIndex: number
  virtualBuffer: number
}

export function useStackTransform(_options: MaybeRefOrGetter<StackTransformOptions>) {
  const options = toRef(_options)

  // Stack can't be greater than virtual buffer - 1
  const getStack = computed(() => Math.min(options.value.stack, options.value.virtualBuffer - 1))

  const getCardStyle = (index: number, completed?: boolean): string => {
    if (!getStack.value || completed) {
      return ''
    }

    const isStacked = index >= options.value.currentIndex && index <= options.value.currentIndex + getStack.value

    const stackLevel = isStacked ? index - options.value.currentIndex : 1
    const offset = stackLevel * options.value.stackOffset
    const scale = 1 - stackLevel * options.value.stackScale

    let transform = ''
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
      default:
        transform = `transform: translate3D(0, ${offset}px, 0) scale(${scale})`
    }

    return `${transform}; opacity: ${isStacked ? 1 : 0}`
  }

  return {
    getStack,
    getCardStyle,
  }
}
