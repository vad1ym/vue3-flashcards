import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[events] reject', () => {
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

  it('should emit reject event when card is rejected programmatically', async () => {
    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('reject')).toBeTruthy()
    expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
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

    infiniteWrapper.vm.reject()
    await infiniteWrapper.vm.$nextTick()

    expect(infiniteWrapper.emitted('reject')).toBeTruthy()
    expect(infiniteWrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
  })

  it('should handle multiple reject calls', async () => {
    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    const rejectEvents = wrapper.emitted('reject')
    expect(rejectEvents).toBeTruthy()
    expect(rejectEvents?.length).toBeGreaterThanOrEqual(1)
  })
})
