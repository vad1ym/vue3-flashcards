import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] swipeThreshold', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('default swipeThreshold', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          swipeThreshold: flashCardsDefaults.swipeThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should emit complete when swiped beyond swipeThreshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve') // approved = true
    })

    it('should not complete when swiped below swipeThreshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeRightBelowThreshold()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })

  describe('custom swipeThreshold', () => {
    it('should accept custom swipeThreshold value', () => {
      const customThreshold = 200
      const customWrapper = mount(FlashCard, {
        props: {
          swipeThreshold: customThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })

      expect(customWrapper.props('swipeThreshold')).toBe(customThreshold)
    })
  })
})
