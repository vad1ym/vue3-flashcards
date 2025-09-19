import type { DOMWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] max-rotation', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(FlashCard, {
      props: {
        maxRotation: flashCardsDefaults.maxRotation,
      },
      slots: {
        default: '<div class="card-content">Test Card</div>',
      },
    })
  })

  describe('default', () => {
    let cardElement: DOMWrapper<HTMLElement>

    beforeEach(() => {
      cardElement = wrapper.find('.flash-card')
    })

    const checkRotation = async (expected: number) => {
      await wrapper.vm.$nextTick()
      const transformDiv = wrapper.find('.flash-card__transform')
      expect(transformDiv.attributes('style')).toContain(`rotate(${expected}deg)`)
    }

    it('should apply rotation transform during drag based on maxRotation', async () => {
      const simulator = new DragSimulator(cardElement).dragRightToThreshold(0.5) // 50% of swipeThreshold
      await checkRotation(flashCardsDefaults.maxRotation * 0.5) // Should be 10deg (50% of 20deg)
      simulator.dragEnd()
    })

    it('should cap rotation at maxRotation when drag distance exceeds swipeThreshold', async () => {
      const simulator = new DragSimulator(cardElement).dragRightToThreshold(1.5) // 150% of swipeThreshold
      await checkRotation(flashCardsDefaults.maxRotation) // Should be 20deg (max rotation)
      simulator.dragEnd()
    })

    it('should restore rotation to 0 when drag ends', async () => {
      const simulator = new DragSimulator(cardElement).dragRightToThreshold(0.5) // 50% of swipeThreshold
      await checkRotation(flashCardsDefaults.maxRotation * 0.5) // Should be 10deg during drag

      simulator.dragEnd()
      await checkRotation(0) // Should be zero
    })
  })
})
