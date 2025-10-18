import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[events] skip', () => {
  let wrapper = mount(FlashCards)

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  beforeEach(() => {
    wrapper = mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: flashCardsDefaults.swipeThreshold,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })
  })

  it('should emit skip event when card is skipped programmatically', async () => {
    wrapper.vm.skip()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('skip')).toBeTruthy()
    expect(wrapper.emitted('skip')?.[0]).toEqual([testItems[0]])
  })

  it('should work with loop mode', async () => {
    const loopWrapper = mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: flashCardsDefaults.swipeThreshold,
        loop: true,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })

    loopWrapper.vm.skip()
    await loopWrapper.vm.$nextTick()

    expect(loopWrapper.emitted('skip')).toBeTruthy()
    expect(loopWrapper.emitted('skip')?.[0]).toEqual([testItems[0]])
  })

  it('should handle multiple skip calls', async () => {
    wrapper.vm.skip()
    await wrapper.vm.$nextTick()

    wrapper.vm.skip()
    await wrapper.vm.$nextTick()

    const skipEvents = wrapper.emitted('skip')
    expect(skipEvents).toBeTruthy()
    expect(skipEvents?.length).toBeGreaterThanOrEqual(1)
  })
})
