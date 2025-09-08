import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] infinite', () => {
  let wrapper: VueWrapper

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  describe('with infinite disabled (default)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          infinite: false,
        },
        slots: {
          default: '{{ item.title }}',
          empty: 'No more cards!',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should show empty state when all cards are processed in finite mode', async () => {
      // Swipe approve all three cards
      for (let i = 0; i < 3; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should show empty state
      expect(wrapper.text()).toContain('No more cards!')
      expect(wrapper.find('.flashcards-empty-state').exists()).toBe(true)
    })

    it('should emit correct events for processed items in finite mode', async () => {
      // Swipe approve first card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should emit approve event with first item
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
    })

    it('should not complete card when dragged below threshold in finite mode', async () => {
      // Drag below threshold (should restore)
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).dragRightBelowThreshold()
      await wrapper.vm.$nextTick()

      // Should not emit approve event
      expect(wrapper.emitted('approve')).toBeFalsy()

      // Should still show first card
      expect(wrapper.find('.flashcards__card--active').text()).toContain('Card 1')
    })

    it('should reach end state when all cards processed in finite mode', async () => {
      // Process all cards
      for (let i = 0; i < 3; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should show empty state indicating end
      expect(wrapper.find('.flashcards-empty-state').exists()).toBe(true)
    })
  })

  describe('with infinite enabled', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          infinite: true,
        },
        slots: {
          default: '{{ item.title }}',
          empty: 'No more cards!',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not show empty state in infinite mode', async () => {
      // Process all cards multiple times
      for (let i = 0; i < 10; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should never show empty state
      expect(wrapper.find('.flashcards-empty-state').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('No more cards!')
    })

    it('should cycle through items indefinitely in infinite mode', async () => {
      const approveEvents: any[] = []

      // Process more cards than we have items
      for (let i = 0; i < 7; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()

        const events = wrapper.emitted('approve')
        if (events) {
          approveEvents.push(events[events.length - 1][0])
        }
      }

      // Should cycle through items: 0, 1, 2, 0, 1, 2, 0
      expect(approveEvents[0]).toEqual(testItems[0])
      expect(approveEvents[1]).toEqual(testItems[1])
      expect(approveEvents[2]).toEqual(testItems[2])
      expect(approveEvents[3]).toEqual(testItems[0]) // Cycling back
      expect(approveEvents[4]).toEqual(testItems[1])
      expect(approveEvents[5]).toEqual(testItems[2])
      expect(approveEvents[6]).toEqual(testItems[0]) // Cycling again
    })

    it('should never show empty state even after many swipes in infinite mode', async () => {
      // Process many cards
      for (let i = 0; i < 20; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should never show empty state
      expect(wrapper.find('.flashcards-empty-state').exists()).toBe(false)
    })

    it('should support both approve and reject swipes in infinite mode', async () => {
      // Swipe approve first card
      let activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Swipe reject second card
      activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      // Should have both approve and reject events
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[1]])
    })
  })

  describe('with empty items array', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: [],
          infinite: false,
        },
        slots: {
          default: '{{ item.title }}',
          empty: 'No items provided!',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should show empty state immediately when items array is empty', () => {
      expect(wrapper.text()).toContain('No items provided!')
      expect(wrapper.find('.flashcards-empty-state').exists()).toBe(true)
    })

    it('should not have any active cards when items array is empty', () => {
      expect(wrapper.find('.flashcards__card--active').exists()).toBe(false)
    })
  })
})
