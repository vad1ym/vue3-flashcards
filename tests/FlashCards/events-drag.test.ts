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

describe('[events] drag events', () => {
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

  describe('dragstart event', () => {
    it('should emit dragstart when user starts dragging a card', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')
      expect(firstCard.exists()).toBe(true)

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 10, y: 0 }]) // Small movement to trigger drag

      await wrapper.vm.$nextTick()

      // Should emit dragstart with the current card item
      expect(wrapper.emitted('dragstart')).toBeTruthy()
      expect(wrapper.emitted('dragstart')![0]).toEqual([testCards[0]])
    })

    it('should emit dragstart only once per drag session', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 10, y: 0 }])
        .dragMove([{ x: 20, y: 0 }])
        .dragMove([{ x: 30, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should only emit dragstart once despite multiple moves
      expect(wrapper.emitted('dragstart')).toHaveLength(1)
    })
  })

  describe('dragmove event', () => {
    it('should emit dragmove during card dragging with movement details', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }]) // Drag right, 50% of threshold

      await wrapper.vm.$nextTick()

      // Should emit dragmove with item, type, and delta
      expect(wrapper.emitted('dragmove')).toBeTruthy()
      const dragMoveEvents = wrapper.emitted('dragmove')!

      // Last dragmove event should contain movement details
      const lastEvent = dragMoveEvents[dragMoveEvents.length - 1]
      expect(lastEvent[0]).toEqual(testCards[0]) // item
      expect(lastEvent[1]).toBe('approve') // type (right movement)
      expect(lastEvent[2]).toBeCloseTo(0.5, 1) // delta (50% of threshold)
    })

    it('should emit dragmove with null type when within threshold', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 3, y: 0 }]) // Very small movement

      await wrapper.vm.$nextTick()

      if (wrapper.emitted('dragmove')) {
        const dragMoveEvents = wrapper.emitted('dragmove')!
        const lastEvent = dragMoveEvents[dragMoveEvents.length - 1]
        expect(lastEvent[1]).toBe(null) // type should be null for small movements
      }
    })

    it('should emit dragmove with reject type for left movement', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: -50, y: 0 }]) // Drag left

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('dragmove')).toBeTruthy()
      const dragMoveEvents = wrapper.emitted('dragmove')!
      const lastEvent = dragMoveEvents[dragMoveEvents.length - 1]
      expect(lastEvent[1]).toBe('reject') // type (left movement)
      expect(lastEvent[2]).toBeCloseTo(-0.5, 1) // negative delta
    })

    it('should emit multiple dragmove events during continuous dragging', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 20, y: 0 }])
        .dragMove([{ x: 40, y: 0 }])
        .dragMove([{ x: 60, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should emit multiple dragmove events
      expect(wrapper.emitted('dragmove')).toBeTruthy()
      expect(wrapper.emitted('dragmove')!.length).toBeGreaterThan(1)
    })
  })

  describe('dragend event', () => {
    it('should emit dragend when user stops dragging', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should emit dragend with the current card item
      expect(wrapper.emitted('dragend')).toBeTruthy()
      expect(wrapper.emitted('dragend')![0]).toEqual([testCards[0]])
    })

    it('should emit dragend even if swipe is cancelled', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 20, y: 0 }]) // Below swipe threshold
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should emit dragend even for cancelled swipes
      expect(wrapper.emitted('dragend')).toBeTruthy()
      expect(wrapper.emitted('dragend')![0]).toEqual([testCards[0]])
    })

    it('should emit dragend only once per drag session', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should only emit dragend once
      expect(wrapper.emitted('dragend')).toHaveLength(1)
    })
  })

  describe('complete drag cycle', () => {
    it('should emit dragstart, dragmove, and dragend in sequence', async () => {
      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should emit all three drag events
      expect(wrapper.emitted('dragstart')).toBeTruthy()
      expect(wrapper.emitted('dragmove')).toBeTruthy()
      expect(wrapper.emitted('dragend')).toBeTruthy()

      // All events should reference the same item
      expect(wrapper.emitted('dragstart')![0][0]).toEqual(testCards[0])
      expect(wrapper.emitted('dragend')![0][0]).toEqual(testCards[0])
    })

    it('should work with vertical swipe direction', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: 'vertical',
          swipeThreshold: 100,
          dragThreshold: 5,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })

      await wrapper.vm.$nextTick() // Wait for mount

      const firstCard = wrapper.find('.flashcards__card--active')
      expect(firstCard.exists()).toBe(true)

      new DragSimulator(firstCard.element as HTMLElement, { swipeThreshold: 100 })
        .dragUpToThreshold(0.5) // Use vertical drag helper
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should emit all drag events for vertical movement
      expect(wrapper.emitted('dragstart')).toBeTruthy()
      expect(wrapper.emitted('dragmove')).toBeTruthy()
      expect(wrapper.emitted('dragend')).toBeTruthy()

      // dragmove should have approve type for upward movement
      if (wrapper.emitted('dragmove')) {
        const dragMoveEvents = wrapper.emitted('dragmove')!
        const lastEvent = dragMoveEvents[dragMoveEvents.length - 1]
        expect(lastEvent[1]).toBe('approve') // up = approve in vertical mode
      }
    })
  })

  describe('drag events with disabled drag', () => {
    it('should not emit drag events when dragging is disabled', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          disableDrag: true,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })

      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }])
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should not emit any drag events when dragging is disabled
      expect(wrapper.emitted('dragstart')).toBeFalsy()
      expect(wrapper.emitted('dragmove')).toBeFalsy()
      expect(wrapper.emitted('dragend')).toBeFalsy()
    })
  })
})
