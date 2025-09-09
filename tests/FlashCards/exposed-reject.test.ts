import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCards from '../../src/FlashCards.vue'

// Test constants for exposed reject functionality
const SMALL_STACK_OFFSET_FOR_TESTING = 10 // Small offset for stack testing

describe('[exposed] reject', () => {
  let wrapper = mount(FlashCards)

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  describe('basic functionality', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should move current card to reject position', async () => {
      const activeCard = wrapper.find<HTMLElement>('.flashcards__card--active')
      expect(activeCard.text()).toContain('Card 1')

      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Check the specific card that was active - it should now be in reject position
      expect(activeCard.element.style.transform).toContain(`translate3D(-${config.defaultThreshold}px, 0px, 0)`)
    })

    it('should emit reject event with current item', async () => {
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Wait for the complete event to be processed
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
    })

    it('should advance to next card after reject animation', async () => {
      const initialCard = wrapper.find('.flashcards__card--active')
      expect(initialCard.text()).toContain('Card 1')

      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Wait for animation and card transition
      await new Promise(resolve => setTimeout(resolve, 100))

      const nextCard = wrapper.find('.flashcards__card--active')
      expect(nextCard.text()).toContain('Card 2')
    })

    it('should emit reject event when called', async () => {
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should emit reject event with correct item
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])

      // Should advance to next card
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.text()).toContain('Card 2')
    })
  })

  describe('with infinite mode', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          infinite: true,
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should work in infinite mode', async () => {
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
    })

    it('should cycle through items in infinite mode', async () => {
      // Reject all items once
      for (let i = 0; i < 3; i++) {
        wrapper.vm.reject()
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Should start cycling - reject first item again
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const rejectEvents = wrapper.emitted('reject')
      expect(rejectEvents).toHaveLength(4)
      expect(rejectEvents?.[3]).toEqual([testItems[0]]) // Cycling back to first
    })
  })

  describe('with stack configuration', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: SMALL_STACK_OFFSET_FOR_TESTING,
          stackScale: 0.95,
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should work with stacked layout', async () => {
      // Should see multiple cards in stack initially
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThan(1)

      const activeCard = wrapper.find<HTMLElement>('.flashcards__card--active')
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Check that the card moved to reject position
      expect(activeCard.element.style.transform).toContain(`translate3D(-${config.defaultThreshold}px, 0px, 0)`)
    })

    it('should maintain stack appearance after reject', async () => {
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should still have multiple cards visible in stack
      const visibleCards = wrapper.findAll('.flashcards__card-wrapper')
      expect(visibleCards.length).toBeGreaterThan(1)
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should handle multiple rapid reject calls', async () => {
      // Call reject multiple times rapidly
      wrapper.vm.reject()
      wrapper.vm.reject()
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // Should handle gracefully without breaking
      const rejectEvents = wrapper.emitted('reject')
      expect(rejectEvents).toBeTruthy()
      expect(rejectEvents!.length).toBeGreaterThanOrEqual(1)
    })

    it('should work at end of finite stack', async () => {
      // Process all but last card
      for (let i = 0; i < 2; i++) {
        wrapper.vm.reject()
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Should be on last card
      const lastCard = wrapper.find('.flashcards__card--active')
      expect(lastCard.text()).toContain('Card 3')

      // Reject last card
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should emit reject event for last card
      const rejectEvents = wrapper.emitted('reject')
      expect(rejectEvents?.[2]).toEqual([testItems[2]])
    })
  })

  describe('with empty items', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: [],
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '{{ item.title }}',
          empty: 'No cards',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should handle reject call with no items gracefully', async () => {
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should not emit reject event
      expect(wrapper.emitted('reject')).toBeFalsy()

      // Should still show empty state
      expect(wrapper.text()).toContain('No cards')
    })
  })

  describe('mixed approve and reject', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should handle alternating approve and reject calls', async () => {
      // Reject first card
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Approve second card
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should have both events
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[1]])
    })

    it('should handle sequential approve and reject calls', async () => {
      // Approve first card (should advance to card 2)
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Reject second card (should advance to card 3)
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should have both events
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[1]])

      // Should now be on third card
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.text()).toContain('Card 3')
    })
  })
})
