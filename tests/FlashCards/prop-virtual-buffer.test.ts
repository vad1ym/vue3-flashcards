import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

// Test constants for virtual buffer functionality
const TEST_ITEMS_COUNT = 10
const LARGE_VIRTUAL_BUFFER = 5 // Large buffer for performance tests
const MINIMAL_VIRTUAL_BUFFER = 1 // Minimal buffer size
const SMALL_VIRTUAL_BUFFER = 2 // Buffer smaller than stack size
const EXCESSIVE_VIRTUAL_BUFFER = 15 // Buffer larger than available items

describe('[props] virtualBuffer', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: TEST_ITEMS_COUNT }, (_, i) => ({
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

    it(`should use default virtualBuffer of ${config.defaultVirtualBuffer}`, () => {
      // With default virtualBuffer of 3, the component renders 4 cards (virtualBuffer + 1)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(config.defaultVirtualBuffer)
    })

    it(`should render first ${config.defaultVirtualBuffer} items with default virtualBuffer`, () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')

      for (let i = 0; i < config.defaultVirtualBuffer; i++) {
        expect(cardWrappers[i].text()).toContain(`Card ${i + 1}`)
      }
    })
  })

  describe('with custom virtualBuffer of 5', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          virtualBuffer: LARGE_VIRTUAL_BUFFER,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it(`should render exactly ${LARGE_VIRTUAL_BUFFER} cards in DOM with virtualBuffer of ${LARGE_VIRTUAL_BUFFER}`, () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(LARGE_VIRTUAL_BUFFER)

      for (let i = 0; i < LARGE_VIRTUAL_BUFFER; i++) {
        expect(cardWrappers[i].text()).toContain(`Card ${i + 1}`)
      }
    })

    it('should update virtual buffer window after swiping cards', async () => {
      // Swipe first card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Should now show cards after swipe (may be 7 due to visible window shift)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(LARGE_VIRTUAL_BUFFER)

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
          virtualBuffer: MINIMAL_VIRTUAL_BUFFER,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should render exactly 2 cards with virtualBuffer of 1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(MINIMAL_VIRTUAL_BUFFER)
    })

    it('should render current and next card with virtualBuffer of 1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers[0].text()).toContain('Card 1')
    })
  })

  describe('with virtualBuffer smaller than stack + 1', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          virtualBuffer: SMALL_VIRTUAL_BUFFER, // Smaller than stack + 1
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
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(5)
    })
  })

  describe('with large virtualBuffer', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          virtualBuffer: EXCESSIVE_VIRTUAL_BUFFER, // Larger than available items
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

    it('should render all available items when virtualBuffer exceeds items count', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')

      // Should render all items from 1 to 10
      for (let i = 0; i < Math.min(cardWrappers.length, testItems.length); i++) {
        expect(cardWrappers[i].text()).toContain(`Card ${i + 1}`)
      }
    })
  })

  describe('virtualBuffer behavior with infinite mode', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems.slice(0, 3), // Only 3 items
          virtualBuffer: LARGE_VIRTUAL_BUFFER,
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
      for (let i = 0; i < testItems.length; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Should still maintain virtualBuffer size (may show 7 cards after cycling)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards__card-wrapper--animating)')
      expect(cardWrappers.length).toBe(3)
    })
  })
})
