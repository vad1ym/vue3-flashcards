import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[exposed] restore', () => {
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
          threshold: 150,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should restore the current card when called', async () => {
      // Get reference to the current active card
      const activeCard = wrapper.find<HTMLElement>('.flashcards__card--active')

      // First approve the card programmatically
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // The card should move to approve position
      expect(activeCard.element.style.transform).toContain('translate3D(151px, 0px, 0)')

      // Restore the card
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Card should return to original position
      expect(activeCard.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should restore card after reject action', async () => {
      // Get reference to the current active card
      const activeCard = wrapper.find<HTMLElement>('.flashcards__card--active')

      // First reject the card programmatically
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // The card should move to reject position
      expect(activeCard.element.style.transform).toContain('translate3D(-151px, 0px, 0)')

      // Restore the card
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Card should return to original position
      expect(activeCard.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should work when canRestore is true', async () => {
      // Process one card first to have something to restore
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should be able to restore
      expect(wrapper.vm.canRestore).toBe(true)

      // Call restore
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should restore to previous card
      const newActiveCard = wrapper.find('.flashcards__card--active')
      expect(newActiveCard.text()).toContain('Card 1')
    })

    it('should not cause issues when canRestore is false', async () => {
      // Initially canRestore should be false (no cards processed yet)
      expect(wrapper.vm.canRestore).toBe(false)

      // Call restore anyway
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should not cause any issues
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.text()).toContain('Card 1')
    })
  })

  describe('with infinite mode', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          infinite: true,
          threshold: 150,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should restore previous card in infinite mode', async () => {
      // Process first card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should now show second card
      const secondCard = wrapper.find('.flashcards__card--active')
      expect(secondCard.text()).toContain('Card 2')

      // Restore should bring back first card
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      const restoredCard = wrapper.find('.flashcards__card--active')
      expect(restoredCard.text()).toContain('Card 1')
    })

    it('should work after cycling through items in infinite mode', async () => {
      // Cycle through all items once
      for (let i = 0; i < 3; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should now show first card again
      const cycledCard = wrapper.find('.flashcards__card--active')
      expect(cycledCard.text()).toContain('Card 1')

      // Should be able to restore
      expect(wrapper.vm.canRestore).toBe(true)

      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should restore to previous card (Card 3)
      const restoredCard = wrapper.find('.flashcards__card--active')
      expect(restoredCard.text()).toContain('Card 3')
    })
  })

  describe('with stack configuration', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          threshold: 150,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should restore card in stacked layout', async () => {
      // Process first card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Restore the card
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should restore properly even with stack layout
      const restoredCard = wrapper.find('.flashcards__card--active')
      expect(restoredCard.text()).toContain('Card 1')
    })

    it('should maintain stack visual appearance after restore', async () => {
      // Process a card and restore
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should still have stack appearance (multiple cards visible)
      const allCards = wrapper.findAll('.flashcards__card-wrapper')
      expect(allCards.length).toBeGreaterThan(1)
    })
  })

  describe('multiple calls', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: 150,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should handle multiple restore calls safely', async () => {
      // Process one card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Call restore multiple times
      wrapper.vm.restore()
      wrapper.vm.restore()
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should work without errors
      const restoredCard = wrapper.find('.flashcards__card--active')
      expect(restoredCard.text()).toContain('Card 1')
    })

    it('should not break when called on fresh component', async () => {
      // Call restore immediately without processing any cards
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should not cause errors
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.text()).toContain('Card 1')
    })
  })
})
