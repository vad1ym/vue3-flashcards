import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toRef } from 'vue'

export interface StackTransformOptions {
  stack: number
  stackOffset: number
  stackDirection: 'top' | 'left' | 'right' | 'bottom'
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
    const scale = 1 - stackLevel * 0.05

    let transform = ''
    switch (options.value.stackDirection) {
      case 'top':
        transform = `transform: translate3D(0, -${offset}px, 0) scale(${scale})`
        break
      case 'bottom':
        transform = `transform: translate3D(0, ${offset}px, 0) scale(${scale})`
        break
      case 'left':
        transform = `transform: translate3D(-${offset}px, 0, 0) scale(${scale})`
        break
      case 'right':
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
