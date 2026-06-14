import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { hasPositiveXTransform, hasTranslate3DOffset, parseTranslate3D } from '../utils/test-helpers'

const testItems = [
  { id: 1, title: 'Card 1' },
  { id: 2, title: 'Card 2' },
]

function activeCardStyle(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.flashcards__card--active').attributes('style')
}

describe('[exposed] peek', () => {
  let wrapper = mount(FlashCards)

  beforeEach(() => {
    wrapper = mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: 150,
      },
      slots: { default: '{{ item.title }}' },
      global: { stubs: { Transition: false } },
    })
  })

  it('moves the active card toward the given direction', async () => {
    wrapper.vm.peek(1, 'right')
    await wrapper.vm.$nextTick()
    const style = activeCardStyle(wrapper)
    expect(hasPositiveXTransform(style)).toBe(true)
    const parsed = parseTranslate3D(style)
    expect(parsed?.x).toBeCloseTo(150, 0)
  })

  it('peek(0.1, dir) moves a fraction of the threshold', async () => {
    wrapper.vm.peek(0.1, 'right')
    await wrapper.vm.$nextTick()
    const parsed = parseTranslate3D(activeCardStyle(wrapper))
    expect(parsed?.x).toBeCloseTo(15, 0)
  })

  it('peek(0, dir) resets to center', async () => {
    wrapper.vm.peek(1, 'right')
    await wrapper.vm.$nextTick()
    wrapper.vm.peek(0, 'right')
    await wrapper.vm.$nextTick()
    expect(hasTranslate3DOffset(activeCardStyle(wrapper))).toBe(false)
  })

  it('moves left for a left direction', async () => {
    wrapper.vm.peek(1, 'left')
    await wrapper.vm.$nextTick()
    const parsed = parseTranslate3D(activeCardStyle(wrapper))
    expect(parsed?.x).toBeCloseTo(-150, 0)
  })

  it('ignores a direction that is not enabled', async () => {
    // Horizontal deck — 'top' is disabled, card stays put.
    wrapper.vm.peek(1, 'top')
    await wrapper.vm.$nextTick()
    expect(hasTranslate3DOffset(activeCardStyle(wrapper))).toBe(false)
  })

  it('clamps percent above 1', async () => {
    wrapper.vm.peek(5, 'right')
    await wrapper.vm.$nextTick()
    const parsed = parseTranslate3D(activeCardStyle(wrapper))
    expect(parsed?.x).toBeCloseTo(150, 0)
  })
})
