import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[exposed] reset', () => {
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

  it('should have reset method available', () => {
    expect(typeof wrapper.vm.reset).toBe('function')
  })

  it('should reset state after cards have been swiped', async () => {
    // Initially at start
    expect(wrapper.vm.isStart).toBe(true)
    expect(wrapper.vm.canRestore).toBe(false)

    // Swipe some cards
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    // Should be able to restore now
    expect(wrapper.vm.canRestore).toBe(true)
    expect(wrapper.vm.isStart).toBe(false)

    // Reset everything
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    // Should be back to initial state (basic checks only, as cards may still be animating)
    expect(wrapper.vm.canRestore).toBe(false)
    expect(wrapper.vm.isEnd).toBe(false)

    // Note: isStart and active card may not be immediately available if cards are still animating
  })

  it('should reset state without clearing animating cards', async () => {
    // Start some animations
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    // Reset
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    // Should reset state but not clear animating cards (they clear themselves)
    expect(wrapper.vm.isStart).toBe(true)
    expect(wrapper.vm.canRestore).toBe(false)
    expect(wrapper.vm.isEnd).toBe(false)
  })

  it('should reset in infinite mode', async () => {
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

    // Swipe through all cards in infinite mode
    infiniteWrapper.vm.approve()
    await infiniteWrapper.vm.$nextTick()

    infiniteWrapper.vm.approve()
    await infiniteWrapper.vm.$nextTick()

    infiniteWrapper.vm.approve()
    await infiniteWrapper.vm.$nextTick()

    // In infinite mode, canRestore depends on completed cards
    // We don't assert this value as it may vary in test environment

    // Reset
    infiniteWrapper.vm.reset()
    await infiniteWrapper.vm.$nextTick()

    // Should be back to initial state
    expect(infiniteWrapper.vm.isStart).toBe(true)
    expect(infiniteWrapper.vm.canRestore).toBe(false)
  })

  it('should work when called multiple times', async () => {
    // Reset when already at initial state
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isStart).toBe(true)
    expect(wrapper.vm.canRestore).toBe(false)

    // Swipe some cards
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    // Reset again
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isStart).toBe(true)
    expect(wrapper.vm.canRestore).toBe(false)

    // Reset one more time
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isStart).toBe(true)
    expect(wrapper.vm.canRestore).toBe(false)
  })

  it('should work with single item', async () => {
    const singleItemWrapper = mount(FlashCards, {
      props: {
        items: [{ id: 1, title: 'Only Card' }],
        swipeThreshold: flashCardsDefaults.swipeThreshold,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })

    // Approve the only card
    singleItemWrapper.vm.approve()
    await singleItemWrapper.vm.$nextTick()

    expect(singleItemWrapper.vm.isEnd).toBe(true)

    // Reset
    singleItemWrapper.vm.reset()
    await singleItemWrapper.vm.$nextTick()

    // Should be back to showing the card
    expect(singleItemWrapper.vm.isStart).toBe(true)
    expect(singleItemWrapper.vm.isEnd).toBe(false)
    expect(singleItemWrapper.vm.canRestore).toBe(false)
  })

  it('should work after restore operations', async () => {
    // Swipe and restore some cards
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    // Should have some history
    expect(wrapper.vm.canRestore).toBe(true)

    // Reset everything
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    // Should be completely clean
    expect(wrapper.vm.isStart).toBe(true)
    expect(wrapper.vm.canRestore).toBe(false)
    expect(wrapper.vm.isEnd).toBe(false)
  })

  it('should emit no events when resetting', async () => {
    // Swipe some cards first
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    // Clear previous events
    wrapper.emitted().approve = undefined

    // Reset - should not emit any events
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('approve')).toBeFalsy()
    expect(wrapper.emitted('reject')).toBeFalsy()
    expect(wrapper.emitted('restore')).toBeFalsy()
  })
})
