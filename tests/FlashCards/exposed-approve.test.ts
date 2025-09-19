import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[exposed] approve', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCards>>

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

  it('should emit approve event when approve method is called', async () => {
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
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

    loopWrapper.vm.approve()
    await loopWrapper.vm.$nextTick()

    expect(loopWrapper.emitted('approve')).toBeTruthy()
    expect(loopWrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
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

    stackWrapper.vm.approve()
    await stackWrapper.vm.$nextTick()

    expect(stackWrapper.emitted('approve')).toBeTruthy()
    expect(stackWrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
  })
})
