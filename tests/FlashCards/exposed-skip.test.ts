import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[exposed] skip', () => {
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

  it('should emit skip event when skip method is called', async () => {
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

  it('should work with stack configuration', async () => {
    const stackWrapper = mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: flashCardsDefaults.swipeThreshold,
        stack: 2,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })

    stackWrapper.vm.skip()
    await stackWrapper.vm.$nextTick()

    expect(stackWrapper.emitted('skip')).toBeTruthy()
    expect(stackWrapper.emitted('skip')?.[0]).toEqual([testItems[0]])
  })
})
