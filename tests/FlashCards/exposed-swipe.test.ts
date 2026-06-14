import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

const testItems = [
  { id: 1, title: 'Card 1' },
  { id: 2, title: 'Card 2' },
  { id: 3, title: 'Card 3' },
]

function mountDeck(props: Record<string, unknown> = {}) {
  return mount(FlashCards, {
    props: {
      items: testItems,
      swipeThreshold: flashCardsDefaults.swipeThreshold,
      ...props,
    },
    slots: { default: '{{ item.title }}' },
    global: { stubs: { Transition: false } },
  })
}

describe('[exposed] swipe(direction)', () => {
  let wrapper = mountDeck()

  beforeEach(() => {
    wrapper = mountDeck()
  })

  it('swipe(\'right\') emits swipeRight, like swipeRight()', async () => {
    wrapper.vm.swipe('right')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeRight')?.[0]).toEqual([testItems[0]])
  })

  it('swipe(\'left\') emits swipeLeft', async () => {
    wrapper.vm.swipe('left')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeLeft')?.[0]).toEqual([testItems[0]])
  })

  it('swipe(\'top\') / swipe(\'bottom\') work for a vertical deck', async () => {
    const v = mountDeck({ swipeDirection: 'vertical' })
    v.vm.swipe('top')
    await v.vm.$nextTick()
    expect(v.emitted('swipeTop')?.[0]).toEqual([testItems[0]])
  })
})
