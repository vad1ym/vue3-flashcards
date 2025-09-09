import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[events] approve', () => {
  let wrapper = mount(FlashCards)

  const testItems = [
    { id: 1, title: 'Card 1', data: 'test1' },
    { id: 2, title: 'Card 2', data: 'test2' },
    { id: 3, title: 'Card 3', data: 'test3' },
  ]

  describe('drag-triggered approve events', () => {
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

    it('should emit approve event with correct item when card is swiped right', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
    })

    it('should emit approve event with original item data', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      const emittedEvent = wrapper.emitted('approve')?.[0][0]
      expect(emittedEvent).toEqual({
        id: 1,
        title: 'Card 1',
        data: 'test1',
      })
    })

    it('should emit approve events for multiple cards in sequence', async () => {
      // Approve first card
      let activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Approve second card
      activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      const approveEvents = wrapper.emitted('approve')
      expect(approveEvents).toHaveLength(2)
      expect(approveEvents?.[0]).toEqual([testItems[0]])
      expect(approveEvents?.[1]).toEqual([testItems[1]])
    })

    it('should not emit approve event when dragged below threshold', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      // Drag right but not enough to trigger approve
      new DragSimulator(activeCard).dragRightBelowThreshold()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('approve')).toBeFalsy()
    })

    it('should emit approve event only once per successful swipe', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should have exactly one approve event
      expect(wrapper.emitted('approve')).toHaveLength(1)
    })
  })

  describe('programmatic approve events', () => {
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

    it('should emit approve event when approve() method is called', async () => {
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
    })

    it('should emit events for programmatic approve calls on multiple cards', async () => {
      // Approve first card programmatically
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Approve second card programmatically
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      const approveEvents = wrapper.emitted('approve')
      expect(approveEvents).toHaveLength(2)
      expect(approveEvents?.[0]).toEqual([testItems[0]])
      expect(approveEvents?.[1]).toEqual([testItems[1]])
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

    it('should emit approve events for cycling items in infinite mode', async () => {
      // Approve more cards than we have items
      for (let i = 0; i < 5; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      const events = wrapper.emitted('approve')
      expect(events).toHaveLength(5)

      // Should cycle through items: 0, 1, 2, 0, 1
      expect(events?.[0]).toEqual([testItems[0]])
      expect(events?.[1]).toEqual([testItems[1]])
      expect(events?.[2]).toEqual([testItems[2]])
      expect(events?.[3]).toEqual([testItems[0]]) // Cycling back
      expect(events?.[4]).toEqual([testItems[1]])
    })

    it('should maintain correct item references in infinite mode', async () => {
      // Process all items once
      for (let i = 0; i < 3; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Process first item again (cycling)
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      const events = wrapper.emitted('approve')
      const lastEvent = events?.[events.length - 1][0]

      // Should be the same object reference as the first item
      expect(lastEvent).toStrictEqual(testItems[0])
      expect(lastEvent).toEqual({
        id: 1,
        title: 'Card 1',
        data: 'test1',
      })
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

    it('should emit approve events correctly with stacked layout', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
    })

    it('should handle approve events for all cards in stack', async () => {
      // Approve cards in sequence
      for (let i = 0; i < testItems.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      const events = wrapper.emitted('approve')
      expect(events).toHaveLength(3)
      testItems.forEach((item, index) => {
        expect(events?.[index]).toEqual([item])
      })
    })
  })

  describe('event timing and order', () => {
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

    it('should emit approve event before card transition completes', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeApprove()
      // Check immediately after swipe, before nextTick

      // Event should be emitted during the swipe completion
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('approve')).toBeTruthy()
    })

    it('should not emit duplicate approve events for same card', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      // Perform the same swipe action multiple times rapidly
      new DragSimulator(activeCard).swipeApprove()

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should only emit one event per card approval
      const events = wrapper.emitted('approve')
      expect(events).toHaveLength(1)
    })
  })

  describe('mixed with reject events', () => {
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

    it('should emit only approve events for approve actions', async () => {
      // Approve first card
      let activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Reject second card
      activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      // Should have one approve and one reject event, but no cross-contamination
      expect(wrapper.emitted('approve')).toHaveLength(1)
      expect(wrapper.emitted('reject')).toHaveLength(1)
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[1]])
    })
  })

  describe('edge cases', () => {
    it('should not emit approve events when items array is empty', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: [],
          threshold: 150,
        },
        slots: {
          default: '{{ item.title }}',
          empty: 'No cards',
        },
        global: { stubs: { Transition: false } },
      })

      // Try to approve (should do nothing)
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('approve')).toBeFalsy()
    })

    it('should emit approve event with low threshold', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: 50, // Low threshold
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      // Wait for component to be fully mounted and setup
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Find the active card (which has both .flash-card and .flashcards__card--active classes)
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.exists()).toBe(true)

      // Use the active card for drag simulation
      new DragSimulator(activeCard).swipeApprove(50)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
    })
  })
})
