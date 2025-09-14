import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'

describe('[props] stackDirection', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default stackDirection (bottom)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply bottom direction transforms to stacked cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should find cards with transform that moves them down (positive Y)
      let hasBottomDirectionTransforms = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style && style.includes('translate3D') && style.match(/translate3D\([^,]+,(?:[^-\s0][^,]*|\s+(?:\S[^,]*)?)px/)) {
            hasBottomDirectionTransforms = true
          }
        }
      })

      expect(hasBottomDirectionTransforms).toBe(true)
    })
  })

  describe('with stackDirection top', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackDirection: 'top',
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply top direction transforms to stacked cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should find cards with transforms
      let hasTopDirectionTransforms = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style && style.includes('translate3D')) {
            hasTopDirectionTransforms = true
          }
        }
      })

      expect(hasTopDirectionTransforms).toBe(true)
    })
  })

  describe('with stackDirection left', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackDirection: 'left',
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply left direction transforms to stacked cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should find cards with transforms
      let hasLeftDirectionTransforms = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style && style.includes('translate3D')) {
            hasLeftDirectionTransforms = true
          }
        }
      })

      expect(hasLeftDirectionTransforms).toBe(true)
    })
  })

  describe('with stackDirection right', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackDirection: 'right',
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply right direction transforms to stacked cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should find cards with transforms
      let hasRightDirectionTransforms = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style && style.includes('translate3D')) {
            hasRightDirectionTransforms = true
          }
        }
      })

      expect(hasRightDirectionTransforms).toBe(true)
    })
  })

  describe('stackDirection with stack=1', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 1,
          stackDirection: 'top',
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply direction transforms with stack=1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThanOrEqual(2)

      // Should have at least one card with direction transform
      let hasDirectionTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style && style.includes('translate3D')) {
            hasDirectionTransform = true
          }
        }
      })

      expect(hasDirectionTransform).toBe(true)
    })
  })

  describe('stackDirection combined with other stack props', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackDirection: 'left',
          stackScale: 0.1,
          stackOffset: 25,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should work correctly with custom stackScale and stackOffset', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should find cards with combined transforms (scale + translate)
      let foundCombinedTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style && style.includes('scale(') && style.includes('translate3D')) {
            foundCombinedTransform = true
          }
        }
      })

      expect(foundCombinedTransform).toBe(true)
    })
  })
})
