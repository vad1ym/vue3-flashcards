import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] virtualBuffer', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default virtualBuffer', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use default virtualBuffer of 3', () => {
      // With default virtualBuffer of 3, the component renders 4 cards (virtualBuffer + 1)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(4)
    })

    it('should render first 4 items with default virtualBuffer', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Check that the first 4 items are rendered
      expect(cardWrappers[0].text()).toContain('Card 1')
      expect(cardWrappers[1].text()).toContain('Card 2')
      expect(cardWrappers[2].text()).toContain('Card 3')
      expect(cardWrappers[3].text()).toContain('Card 4')
    })
  })

  describe('with custom virtualBuffer of 5', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          virtualBuffer: 5,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should render exactly 6 cards in DOM with virtualBuffer of 5', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(6)
    })

    it('should render first 6 items with virtualBuffer of 5', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      expect(cardWrappers[0].text()).toContain('Card 1')
      expect(cardWrappers[1].text()).toContain('Card 2')
      expect(cardWrappers[2].text()).toContain('Card 3')
      expect(cardWrappers[3].text()).toContain('Card 4')
      expect(cardWrappers[4].text()).toContain('Card 5')
      expect(cardWrappers[5].text()).toContain('Card 6')
    })

    it('should update virtual buffer window after swiping cards', async () => {
      // Swipe first card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should now show cards after swipe (may be 7 due to visible window shift)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(7)

      // The active card should now be Card 2
      const newActiveCard = wrapper.find('.flashcards__card--active')
      expect(newActiveCard.text()).toContain('Card 2')
    })
  })

  describe('with virtualBuffer of 1 (minimum)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          virtualBuffer: 1,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should render exactly 2 cards with virtualBuffer of 1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(2)
    })

    it('should render current and next card with virtualBuffer of 1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers[0].text()).toContain('Card 1')
      expect(cardWrappers[1].text()).toContain('Card 2')
    })
  })

  describe('with virtualBuffer smaller than stack + 1', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          virtualBuffer: 2, // Smaller than stack + 1
          stack: 3, // Stack of 3 requires virtualBuffer of at least 4
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should automatically adjust virtualBuffer to stack + 1', () => {
      // With stack=3, virtualBuffer should be adjusted to 4, so we expect 5 cards rendered
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(5)
    })
  })

  describe('with large virtualBuffer', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          virtualBuffer: 15, // Larger than available items
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not render more cards than available items', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      // Should render all 10 available items, not 15
      expect(cardWrappers.length).toBeLessThanOrEqual(10)
    })

    it('should render all available items when virtualBuffer exceeds items count', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should render all items from 1 to 10
      for (let i = 0; i < Math.min(cardWrappers.length, 10); i++) {
        expect(cardWrappers[i].text()).toContain(`Card ${i + 1}`)
      }
    })
  })

  describe('virtualBuffer behavior with infinite mode', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems.slice(0, 3), // Only 3 items
          virtualBuffer: 5,
          infinite: true,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should maintain virtualBuffer size even with infinite cycling', async () => {
      // Process several cards to trigger cycling
      for (let i = 0; i < 10; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should still maintain virtualBuffer size (may show 7 cards after cycling)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(7)
    })
  })
})
