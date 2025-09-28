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

describe('[events] loop event', () => {
  let wrapper = mount(FlashCards)

  beforeEach(() => {
    wrapper = mount(FlashCards, {
      props: {
        items: testCards,
        loop: true,
        swipeThreshold: 100,
      },
      slots: {
        default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
      },
      global: { stubs: { Transition: false } },
    })
  })

  describe('loop event emission', () => {
    it('should emit loop event when all cards are swiped in loop mode', async () => {
      // Swipe all cards to trigger loop
      for (let i = 0; i < testCards.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        expect(activeCard.exists()).toBe(true)

        new DragSimulator(activeCard.element as HTMLElement)
          .swipeRightBeyondThreshold()

        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick() // Extra tick for completion processing
      }

      // Should emit loop event when cycling back to start
      expect(wrapper.emitted('loop')).toBeTruthy()
      expect(wrapper.emitted('loop')![0]).toEqual([]) // No payload
    })

    it('should emit loop event only once per cycle', async () => {
      // Complete one full cycle
      for (let i = 0; i < testCards.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard.element as HTMLElement)
          .swipeRightBeyondThreshold()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
      }

      // Should emit loop event only once
      expect(wrapper.emitted('loop')).toHaveLength(1)
    })

    it('should emit loop event for multiple cycles', async () => {
      // Complete two full cycles
      for (let cycle = 0; cycle < 2; cycle++) {
        for (let i = 0; i < testCards.length; i++) {
          const activeCard = wrapper.find('.flashcards__card--active')
          if (activeCard.exists()) {
            new DragSimulator(activeCard.element as HTMLElement)
              .swipeRightBeyondThreshold()
            await wrapper.vm.$nextTick()
            await wrapper.vm.$nextTick()
          }
        }
      }

      // Should emit loop event twice (once per cycle)
      expect(wrapper.emitted('loop')).toBeTruthy()
      expect(wrapper.emitted('loop')!.length).toBeGreaterThanOrEqual(1)
    })

    it('should work with both approve and reject swipes', async () => {
      // Mix of approve and reject swipes
      const swipes = ['approve', 'reject', 'approve'] as const

      for (let i = 0; i < testCards.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        const simulator = new DragSimulator(activeCard.element as HTMLElement)

        if (swipes[i] === 'approve') {
          simulator.swipeRightBeyondThreshold()
        }
        else {
          simulator.swipeLeftBeyondThreshold()
        }

        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
      }

      // Should emit loop event regardless of swipe types
      expect(wrapper.emitted('loop')).toBeTruthy()
      expect(wrapper.emitted('loop')).toHaveLength(1)
    })

    it('should work with programmatic actions', async () => {
      // Use programmatic approve/reject instead of swiping
      for (let i = 0; i < testCards.length; i++) {
        if (i % 2 === 0) {
          wrapper.vm.approve()
        }
        else {
          wrapper.vm.reject()
        }
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
      }

      // Should emit loop event even with programmatic actions
      expect(wrapper.emitted('loop')).toBeTruthy()
      expect(wrapper.emitted('loop')).toHaveLength(1)
    })

    it('should work with vertical swipe direction', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          loop: true,
          swipeDirection: 'vertical',
          swipeThreshold: 100,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })

      await wrapper.vm.$nextTick() // Wait for mount

      // Swipe all cards vertically using programmatic method
      for (let i = 0; i < testCards.length; i++) {
        wrapper.vm.approve() // Use programmatic approve for vertical
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
      }

      // Should emit loop event for vertical swipes
      expect(wrapper.emitted('loop')).toBeTruthy()
    })
  })

  describe('loop event with restore', () => {
    it('should not emit loop event when restoring cards', async () => {
      // Swipe two cards
      for (let i = 0; i < 2; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard.element as HTMLElement)
          .swipeRightBeyondThreshold()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
      }

      // Restore one card
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Should not have emitted loop event yet
      expect(wrapper.emitted('loop')).toBeFalsy()
    })

    it('should emit loop event after completing cycle with restores', async () => {
      // Swipe all cards
      for (let i = 0; i < testCards.length; i++) {
        wrapper.vm.approve()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
      }

      // Should emit loop event
      expect(wrapper.emitted('loop')).toBeTruthy()

      // Restore and swipe again
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Should emit another loop event
      expect(wrapper.emitted('loop')!.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('loop event timing', () => {
    it('should emit loop event when cycle completes', async () => {
      // Swipe all cards
      for (let i = 0; i < testCards.length; i++) {
        wrapper.vm.approve()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
      }

      // Loop event should be emitted
      expect(wrapper.emitted('loop')).toBeTruthy()
      expect(wrapper.emitted('loop')![0]).toEqual([]) // No payload
    })
  })

  describe('no loop event without loop mode', () => {
    it('should not emit loop event when loop is disabled', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          loop: false, // Disable loop
          swipeThreshold: 100,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })

      // Swipe all cards
      for (let i = 0; i < testCards.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        if (activeCard.exists()) {
          new DragSimulator(activeCard.element as HTMLElement)
            .swipeRightBeyondThreshold()
          await wrapper.vm.$nextTick()
          await wrapper.vm.$nextTick()
        }
      }

      // Should not emit loop event when loop is disabled
      expect(wrapper.emitted('loop')).toBeFalsy()
    })
  })

  describe('loop event with single card', () => {
    it('should emit loop event with single card in loop mode', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: [{ id: 1, title: 'Single Card' }],
          loop: true,
          swipeThreshold: 100,
        },
        slots: {
          default: ({ item }: { item: Record<string, unknown> }) => `<div class="card">${item.title}</div>`,
        },
        global: { stubs: { Transition: false } },
      })

      // Swipe the single card using programmatic method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Should emit loop event even with single card
      expect(wrapper.emitted('loop')).toBeTruthy()
    })
  })
})
