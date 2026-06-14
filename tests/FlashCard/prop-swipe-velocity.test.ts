import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

// Distance kept comfortably below the default swipeThreshold (150) so that any
// completion can only come from velocity, never from the distance rule.
const BELOW_THRESHOLD_DISTANCE = 80

function mountCard(props: Record<string, unknown> = {}) {
  return mount(FlashCard, {
    props,
    slots: { default: '<div class="card-content">Test Card</div>' },
    global: { stubs: { Transition: false } },
  })
}

describe('[props] swipeVelocity', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('enabled by default', () => {
    beforeEach(() => {
      wrapper = mountCard()
    })

    it('completes a swipe on a fast flick below the distance threshold', async () => {
      await new DragSimulator(wrapper.element).flick(
        { x: BELOW_THRESHOLD_DISTANCE },
        { steps: 5, stepDelayMs: 2 }, // fast: ~tens of px/ms
      )
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('right')
    })

    it('does not complete a slow drag below the distance threshold', async () => {
      await new DragSimulator(wrapper.element).flick(
        { x: BELOW_THRESHOLD_DISTANCE },
        { steps: 5, stepDelayMs: 60 }, // slow: well under the velocity threshold
      )
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('ignores a flick in a direction that is not enabled', async () => {
      // Default direction is horizontal only — a fast upward flick must not complete.
      await new DragSimulator(wrapper.element).flick(
        { y: -BELOW_THRESHOLD_DISTANCE },
        { steps: 5, stepDelayMs: 2 },
      )
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
    })
  })

  describe('when disabled', () => {
    beforeEach(() => {
      wrapper = mountCard({ swipeVelocityEnabled: false })
    })

    it('does not complete a fast flick below the distance threshold', async () => {
      await new DragSimulator(wrapper.element).flick(
        { x: BELOW_THRESHOLD_DISTANCE },
        { steps: 5, stepDelayMs: 2 },
      )
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
    })
  })

  describe('custom swipeVelocityThreshold', () => {
    it('respects a higher threshold (same flick no longer completes)', async () => {
      // An unreachably high threshold means even a fast flick falls back to the
      // distance rule, which the below-threshold distance does not satisfy.
      wrapper = mountCard({ swipeVelocityThreshold: 1000 })

      await new DragSimulator(wrapper.element).flick(
        { x: BELOW_THRESHOLD_DISTANCE },
        { steps: 5, stepDelayMs: 2 },
      )
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
    })

    it('uses the configured default velocity threshold', () => {
      expect(flashCardsDefaults.swipeVelocityThreshold).toBe(0.5)
      expect(flashCardsDefaults.swipeVelocityEnabled).toBe(true)
    })
  })
})
