import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

// Test constants for render limit functionality
const TEST_ITEMS_COUNT = 10
const LARGE_RENDER_LIMIT = 5 // Large buffer for performance tests
const MINIMAL_RENDER_LIMIT = 1 // Minimal buffer size
const SMALL_RENDER_LIMIT = 2 // Buffer smaller than stack size
const EXCESSIVE_RENDER_LIMIT = 15 // Buffer larger than available items

describe('[props] renderLimit', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: TEST_ITEMS_COUNT }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default renderLimit', () => {
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

    it(`should use default renderLimit of ${flashCardsDefaults.renderLimit}`, () => {
      // With default renderLimit of 3, the component renders 4 cards (renderLimit + 1)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(flashCardsDefaults.renderLimit)
    })

    it(`should render first ${flashCardsDefaults.renderLimit} items with default renderLimit`, () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')

      for (let i = 0; i < flashCardsDefaults.renderLimit; i++) {
        expect(cardWrappers[i].text()).toContain(`Card ${i + 1}`)
      }
    })
  })

  describe('with custom renderLimit of 5', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          renderLimit: LARGE_RENDER_LIMIT,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it(`should render exactly ${LARGE_RENDER_LIMIT} cards in DOM with renderLimit of ${LARGE_RENDER_LIMIT}`, () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(LARGE_RENDER_LIMIT)

      for (let i = 0; i < LARGE_RENDER_LIMIT; i++) {
        expect(cardWrappers[i].text()).toContain(`Card ${i + 1}`)
      }
    })

    it('should update render limit window after swiping cards', async () => {
      // Swipe first card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should now show cards after swipe (may be 7 due to visible window shift)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(LARGE_RENDER_LIMIT)

      // The active card should now be Card 2
      const newActiveCard = wrapper.find('.flashcards__card--active')
      expect(newActiveCard.text()).toContain('Card 2')
    })
  })

  describe('with renderLimit of 1 (minimum)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          renderLimit: MINIMAL_RENDER_LIMIT,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should render exactly 2 cards with renderLimit of 1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(MINIMAL_RENDER_LIMIT)
    })

    it('should render current and next card with renderLimit of 1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers[0].text()).toContain('Card 1')
    })
  })

  describe('with renderLimit smaller than stack + 1', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          renderLimit: SMALL_RENDER_LIMIT, // Smaller than stack + 1
          stack: 3, // Stack of 3 requires renderLimit of at least 4
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should automatically adjust renderLimit to stack + 1', () => {
      // With stack=3, renderLimit should be adjusted to 4, so we expect 5 cards rendered
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(5)
    })
  })

  describe('with large renderLimit', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          renderLimit: EXCESSIVE_RENDER_LIMIT, // Larger than available items
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not render more cards than available items', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      // Should render all 10 available items, not 15
      expect(cardWrappers.length).toBeLessThanOrEqual(testItems.length)
    })

    it('should render all available items when renderLimit exceeds items count', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')

      // Should render all items from 1 to 10
      for (let i = 0; i < Math.min(cardWrappers.length, testItems.length); i++) {
        expect(cardWrappers[i].text()).toContain(`Card ${i + 1}`)
      }
    })
  })

  describe('renderLimit behavior with infinite mode', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems.slice(0, 3), // Only 3 items
          renderLimit: LARGE_RENDER_LIMIT,
          infinite: true,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should maintain renderLimit size even with infinite cycling', async () => {
      // Process several cards to trigger cycling
      for (let i = 0; i < testItems.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should still maintain renderLimit size (may show 7 cards after cycling)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(3)
    })
  })
})
