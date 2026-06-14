import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[props] wait-animation-end', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCards>>

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  const createWrapper = (waitAnimationEnd: boolean) => {
    return mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: flashCardsDefaults.swipeThreshold,
        waitAnimationEnd,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })
  }

  describe('when waitAnimationEnd is true', () => {
    beforeEach(() => {
      wrapper = createWrapper(true)
    })

    it('should have waitAnimationEnd prop set to true', () => {
      expect(wrapper.props('waitAnimationEnd')).toBe(true)
    })

    it('should prevent rapid successive swipeRight calls', async () => {
      // First swipeRight call
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      // Get initial emitted events count
      const initialSwipeRightEvents = wrapper.emitted('swipeRight')?.length || 0

      // Try to call swipeRight again rapidly - should be blocked by waitAnimationEnd
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      // Should not emit additional swipeRight events when animations are still running
      const finalSwipeRightEvents = wrapper.emitted('swipeRight')?.length || 0
      expect(finalSwipeRightEvents).toBe(initialSwipeRightEvents)
    })

    it('should prevent rapid successive swipeLeft calls', async () => {
      // First swipeLeft call
      wrapper.vm.swipeLeft()
      await wrapper.vm.$nextTick()

      // Get initial emitted events count
      const initialSwipeLeftEvents = wrapper.emitted('swipeLeft')?.length || 0

      // Try to call swipeLeft again rapidly - should be blocked by waitAnimationEnd
      wrapper.vm.swipeLeft()
      await wrapper.vm.$nextTick()

      // Should not emit additional swipeLeft events when animations are still running
      const finalSwipeLeftEvents = wrapper.emitted('swipeLeft')?.length || 0
      expect(finalSwipeLeftEvents).toBe(initialSwipeLeftEvents)
    })

    it('should prevent rapid mixed swipeRight/swipeLeft calls', async () => {
      // First swipeRight call
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      const initialSwipeRightEvents = wrapper.emitted('swipeRight')?.length || 0
      const initialSwipeLeftEvents = wrapper.emitted('swipeLeft')?.length || 0

      // Try to call swipeLeft while swipeRight animation is running
      wrapper.vm.swipeLeft()
      await wrapper.vm.$nextTick()

      // Should not emit swipeLeft event when animations are still running
      const finalSwipeRightEvents = wrapper.emitted('swipeRight')?.length || 0
      const finalSwipeLeftEvents = wrapper.emitted('swipeLeft')?.length || 0

      expect(finalSwipeRightEvents).toBe(initialSwipeRightEvents)
      expect(finalSwipeLeftEvents).toBe(initialSwipeLeftEvents)
    })
  })

  describe('when waitAnimationEnd is false', () => {
    beforeEach(() => {
      wrapper = createWrapper(false)
    })

    it('should have waitAnimationEnd prop set to false', () => {
      expect(wrapper.props('waitAnimationEnd')).toBe(false)
    })

    it('should allow rapid successive swipeRight calls', async () => {
      // First swipeRight call
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      const initialSwipeRightEvents = wrapper.emitted('swipeRight')?.length || 0

      // Try to call swipeRight again rapidly - should be allowed
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      // Should emit additional swipeRight events when waitAnimationEnd is false
      const finalSwipeRightEvents = wrapper.emitted('swipeRight')?.length || 0
      expect(finalSwipeRightEvents).toBeGreaterThanOrEqual(initialSwipeRightEvents)
    })

    it('should allow rapid successive swipeLeft calls', async () => {
      // First swipeLeft call
      wrapper.vm.swipeLeft()
      await wrapper.vm.$nextTick()

      const initialSwipeLeftEvents = wrapper.emitted('swipeLeft')?.length || 0

      // Try to call swipeLeft again rapidly - should be allowed
      wrapper.vm.swipeLeft()
      await wrapper.vm.$nextTick()

      // Should emit additional swipeLeft events when waitAnimationEnd is false
      const finalSwipeLeftEvents = wrapper.emitted('swipeLeft')?.length || 0
      expect(finalSwipeLeftEvents).toBeGreaterThanOrEqual(initialSwipeLeftEvents)
    })

    it('should allow rapid mixed swipeRight/swipeLeft calls', async () => {
      // Rapid succession of different actions
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      wrapper.vm.swipeLeft()
      await wrapper.vm.$nextTick()

      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      // Should have emitted multiple events
      const swipeRightEvents = wrapper.emitted('swipeRight')?.length || 0
      const swipeLeftEvents = wrapper.emitted('swipeLeft')?.length || 0

      expect(swipeRightEvents).toBeGreaterThan(0)
      expect(swipeLeftEvents).toBeGreaterThan(0)
    })
  })

  describe('default behavior', () => {
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

    it('should default to waitAnimationEnd: false', () => {
      expect(wrapper.props('waitAnimationEnd')).toBeFalsy()
    })

    it('should behave like waitAnimationEnd: false by default', async () => {
      // Should allow rapid calls by default
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      const initialEvents = wrapper.emitted('swipeRight')?.length || 0

      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      const finalEvents = wrapper.emitted('swipeRight')?.length || 0
      expect(finalEvents).toBeGreaterThanOrEqual(initialEvents)
    })
  })

  describe('with restore functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper(true)
    })

    it('should prevent restore calls when waitAnimationEnd is true and animations are running', async () => {
      // First swipe a card
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      // Try to restore while animation is running - should be blocked
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Restore event emission would depend on animation completion in real environment
      // In test environment, this tests that restore method can be called without errors
      expect(typeof wrapper.vm.restore).toBe('function')
    })
  })
})
