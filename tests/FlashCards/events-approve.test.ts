import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[events] approve', () => {
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

  it('should emit approve event when card is approved programmatically', async () => {
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
  })

  it('should work with infinite mode', async () => {
    const infiniteWrapper = mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: flashCardsDefaults.swipeThreshold,
        infinite: true,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })

    infiniteWrapper.vm.approve()
    await infiniteWrapper.vm.$nextTick()

    expect(infiniteWrapper.emitted('approve')).toBeTruthy()
    expect(infiniteWrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
  })

  it('should handle multiple approve calls', async () => {
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    const approveEvents = wrapper.emitted('approve')
    expect(approveEvents).toBeTruthy()
    expect(approveEvents?.length).toBeGreaterThanOrEqual(1)
  })
})
