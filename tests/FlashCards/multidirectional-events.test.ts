import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

interface TestCard extends Record<string, unknown> {
  id: number
  title: string
}

const testCards: TestCard[] = [
  { id: 1, title: 'Card 1' },
  { id: 2, title: 'Card 2' },
  { id: 3, title: 'Card 3' },
]

describe('[events] multidirectional events', () => {
  let wrapper = mount(FlashCards)

  beforeEach(() => {
    wrapper = mount(FlashCards, {
      props: {
        items: testCards,
        swipeThreshold: 100,
        dragThreshold: 5,
      },
      slots: {
        default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
      },
      global: { stubs: { Transition: false } },
    })
  })

  describe('single direction (right only)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['right'], // Only right swipe allowed
          swipeThreshold: 100,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should emit right and approve events for right swipe', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 200, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should emit both new directional and old compatibility events
      expect(wrapper.emitted('swipeRight')).toBeTruthy()
      expect(wrapper.emitted('swipeRight')![0]).toEqual([testCards[0]])
      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')![0]).toEqual([testCards[0]])

      // Should not emit left, top, bottom, or reject
      expect(wrapper.emitted('swipeLeft')).toBeFalsy()
      expect(wrapper.emitted('swipeTop')).toBeFalsy()
      expect(wrapper.emitted('swipeBottom')).toBeFalsy()
      expect(wrapper.emitted('reject')).toBeFalsy()
    })

    it('should not complete for left swipe (not allowed)', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: -200, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should not emit any completion events for disallowed direction
      expect(wrapper.emitted('swipeLeft')).toBeFalsy()
      expect(wrapper.emitted('swipeRight')).toBeFalsy()
      expect(wrapper.emitted('approve')).toBeFalsy()
      expect(wrapper.emitted('reject')).toBeFalsy()
    })
  })

  describe('two directions (left and right)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['left', 'right'], // Horizontal swipes only
          swipeThreshold: 100,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should emit right and approve for right swipe', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 200, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('swipeRight')).toBeTruthy()
      expect(wrapper.emitted('swipeRight')![0]).toEqual([testCards[0]])
      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')![0]).toEqual([testCards[0]])
    })

    it('should emit left and reject for left swipe', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: -200, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('swipeLeft')).toBeTruthy()
      expect(wrapper.emitted('swipeLeft')![0]).toEqual([testCards[0]])
      expect(wrapper.emitted('reject')).toBeTruthy()
      expect(wrapper.emitted('reject')![0]).toEqual([testCards[0]])
    })

    it('should not complete for vertical swipes', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      // Test top swipe
      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 0, y: -200 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('swipeTop')).toBeFalsy()
      expect(wrapper.emitted('swipeBottom')).toBeFalsy()
    })
  })

  describe('three directions (left, right, top)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['left', 'right', 'top'], // No bottom swipe
          swipeThreshold: 100,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should emit top and approve for top swipe', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 0, y: -200 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('swipeTop')).toBeTruthy()
      expect(wrapper.emitted('swipeTop')![0]).toEqual([testCards[0]])
      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')![0]).toEqual([testCards[0]])
    })

    it('should not complete for bottom swipe (not allowed)', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 0, y: 200 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('swipeBottom')).toBeFalsy()
      expect(wrapper.emitted('reject')).toBeFalsy()
    })
  })

  describe('drag events with backward compatibility', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['left', 'right'],
          swipeThreshold: 100,
          dragThreshold: 5,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should emit both directional and approve/reject dragmove events', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should emit both types of events
      const dragmoveEvents = wrapper.emitted('dragmove')
      expect(dragmoveEvents).toBeTruthy()

      // Should have events for both raw direction and backward compatibility types
      const eventTypes = dragmoveEvents!.map(event => event[1])
      expect(eventTypes).toContain('right')
      expect(eventTypes).toContain('approve')
    })
  })
})
