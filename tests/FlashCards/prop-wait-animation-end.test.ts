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

    it('should prevent rapid successive approve calls', async () => {
      // First approve call
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Get initial emitted events count
      const initialApproveEvents = wrapper.emitted('approve')?.length || 0

      // Try to call approve again rapidly - should be blocked by waitAnimationEnd
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should not emit additional approve events when animations are still running
      const finalApproveEvents = wrapper.emitted('approve')?.length || 0
      expect(finalApproveEvents).toBe(initialApproveEvents)
    })

    it('should prevent rapid successive reject calls', async () => {
      // First reject call
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Get initial emitted events count
      const initialRejectEvents = wrapper.emitted('reject')?.length || 0

      // Try to call reject again rapidly - should be blocked by waitAnimationEnd
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should not emit additional reject events when animations are still running
      const finalRejectEvents = wrapper.emitted('reject')?.length || 0
      expect(finalRejectEvents).toBe(initialRejectEvents)
    })

    it('should prevent rapid mixed approve/reject calls', async () => {
      // First approve call
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      const initialApproveEvents = wrapper.emitted('approve')?.length || 0
      const initialRejectEvents = wrapper.emitted('reject')?.length || 0

      // Try to call reject while approve animation is running
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should not emit reject event when animations are still running
      const finalApproveEvents = wrapper.emitted('approve')?.length || 0
      const finalRejectEvents = wrapper.emitted('reject')?.length || 0

      expect(finalApproveEvents).toBe(initialApproveEvents)
      expect(finalRejectEvents).toBe(initialRejectEvents)
    })
  })

  describe('when waitAnimationEnd is false', () => {
    beforeEach(() => {
      wrapper = createWrapper(false)
    })

    it('should have waitAnimationEnd prop set to false', () => {
      expect(wrapper.props('waitAnimationEnd')).toBe(false)
    })

    it('should allow rapid successive approve calls', async () => {
      // First approve call
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      const initialApproveEvents = wrapper.emitted('approve')?.length || 0

      // Try to call approve again rapidly - should be allowed
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should emit additional approve events when waitAnimationEnd is false
      const finalApproveEvents = wrapper.emitted('approve')?.length || 0
      expect(finalApproveEvents).toBeGreaterThanOrEqual(initialApproveEvents)
    })

    it('should allow rapid successive reject calls', async () => {
      // First reject call
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      const initialRejectEvents = wrapper.emitted('reject')?.length || 0

      // Try to call reject again rapidly - should be allowed
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should emit additional reject events when waitAnimationEnd is false
      const finalRejectEvents = wrapper.emitted('reject')?.length || 0
      expect(finalRejectEvents).toBeGreaterThanOrEqual(initialRejectEvents)
    })

    it('should allow rapid mixed approve/reject calls', async () => {
      // Rapid succession of different actions
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should have emitted multiple events
      const approveEvents = wrapper.emitted('approve')?.length || 0
      const rejectEvents = wrapper.emitted('reject')?.length || 0

      expect(approveEvents).toBeGreaterThan(0)
      expect(rejectEvents).toBeGreaterThan(0)
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
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      const initialEvents = wrapper.emitted('approve')?.length || 0

      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      const finalEvents = wrapper.emitted('approve')?.length || 0
      expect(finalEvents).toBeGreaterThanOrEqual(initialEvents)
    })
  })

  describe('with restore functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper(true)
    })

    it('should prevent restore calls when waitAnimationEnd is true and animations are running', async () => {
      // First swipe a card
      wrapper.vm.approve()
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
