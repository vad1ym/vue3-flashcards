import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[events] reject', () => {
  let wrapper = mount(FlashCards)

  const testItems = [
    { id: 1, title: 'Card 1', data: 'test1' },
    { id: 2, title: 'Card 2', data: 'test2' },
    { id: 3, title: 'Card 3', data: 'test3' },
  ]

  describe('drag-triggered reject events', () => {
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

    it('should emit reject event with correct item when card is swiped left', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reject')).toBeTruthy()
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
    })

    it('should emit reject event with original item data', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      const emittedEvent = wrapper.emitted('reject')?.[0][0]
      expect(emittedEvent).toEqual({
        id: 1,
        title: 'Card 1',
        data: 'test1',
      })
    })

    it('should emit reject events for multiple cards in sequence', async () => {
      // Reject first card
      let activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      // Reject second card
      activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      const rejectEvents = wrapper.emitted('reject')
      expect(rejectEvents).toHaveLength(2)
      expect(rejectEvents?.[0]).toEqual([testItems[0]])
      expect(rejectEvents?.[1]).toEqual([testItems[1]])
    })

    it('should not emit reject event when dragged below threshold', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      // Drag left but not enough to trigger reject
      new DragSimulator(activeCard).dragLeftBelowThreshold()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reject')).toBeFalsy()
    })

    it('should emit reject event only once per successful swipe', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      // Should have exactly one reject event
      expect(wrapper.emitted('reject')).toHaveLength(1)
    })
  })

  describe('programmatic reject events', () => {
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

    it('should emit reject event when reject() method is called', async () => {
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('reject')).toBeTruthy()
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
    })

    it('should emit events for programmatic reject calls on multiple cards', async () => {
      // Reject first card programmatically
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Reject second card programmatically
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      const rejectEvents = wrapper.emitted('reject')
      expect(rejectEvents).toHaveLength(2)
      expect(rejectEvents?.[0]).toEqual([testItems[0]])
      expect(rejectEvents?.[1]).toEqual([testItems[1]])
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

    it('should emit reject events for cycling items in infinite mode', async () => {
      // Reject more cards than we have items
      for (let i = 0; i < 5; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeReject()
        await wrapper.vm.$nextTick()
      }

      const events = wrapper.emitted('reject')
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
        new DragSimulator(activeCard).swipeReject()
        await wrapper.vm.$nextTick()
      }

      // Process first item again (cycling)
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      const events = wrapper.emitted('reject')
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

    it('should emit reject events correctly with stacked layout', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
    })

    it('should handle reject events for all cards in stack', async () => {
      // Reject cards in sequence
      for (let i = 0; i < testItems.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeReject()
        await wrapper.vm.$nextTick()
      }

      const events = wrapper.emitted('reject')
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

    it('should emit reject event before card transition completes', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(activeCard).swipeReject()
      // Check immediately after swipe, before nextTick

      // Event should be emitted during the swipe completion
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('reject')).toBeTruthy()
    })

    it('should not emit duplicate reject events for same card', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')

      // Perform the same swipe action
      new DragSimulator(activeCard).swipeReject()

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should only emit one event per card rejection
      const events = wrapper.emitted('reject')
      expect(events).toHaveLength(1)
    })
  })

  describe('mixed with approve events', () => {
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

    it('should emit only reject events for reject actions', async () => {
      // Reject first card
      let activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      // Approve second card
      activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should have one reject and one approve event, but no cross-contamination
      expect(wrapper.emitted('reject')).toHaveLength(1)
      expect(wrapper.emitted('approve')).toHaveLength(1)
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[1]])
    })

    it('should handle alternating reject and approve events correctly', async () => {
      // Reject first
      let activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      // Approve second
      activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Reject third
      activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeReject()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reject')).toHaveLength(2)
      expect(wrapper.emitted('approve')).toHaveLength(1)
      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[1]])
      expect(wrapper.emitted('reject')?.[1]).toEqual([testItems[2]])
    })
  })

  describe('edge cases', () => {
    it('should not emit reject events when items array is empty', async () => {
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

      // Try to reject (should do nothing)
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reject')).toBeFalsy()
    })

    it('should emit reject event with low threshold', async () => {
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
      new DragSimulator(activeCard).swipeReject(50)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('reject')?.[0]).toEqual([testItems[0]])
    })

    it('should handle high threshold correctly', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: 500, // Very high threshold
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const activeCard = wrapper.find('.flashcards__card--active')

      // Normal drag should not trigger reject with high threshold
      new DragSimulator(activeCard)
        .dragStart()
        .dragMove([{ x: -200 }]) // Normal movement but below high threshold
        .dragEnd()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reject')).toBeFalsy()
    })
  })
})
