import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'

describe('[exposed] restore', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  beforeEach(() => {
    wrapper = mount(FlashCard, {
      props: {
        threshold: config.defaultThreshold,
      },
      slots: {
        default: '<div class="card-content">Test Card</div>',
      },
      global: { stubs: { Transition: false } },
    })
  })

  it('should restore card to original position after approve', async () => {
    // First approve the card
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    // Verify complete event was emitted
    expect(wrapper.emitted('complete')).toBeTruthy()

    // Then restore it
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    const cardElement = wrapper.element as HTMLElement
    expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
  })

  it('should restore card to original position after reject', async () => {
    // First reject the card
    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    // Verify complete event was emitted
    expect(wrapper.emitted('complete')).toBeTruthy()

    // Then restore it
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    const cardElement = wrapper.element as HTMLElement
    expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
  })

  it('should hide all indicators after restore', async () => {
    // First approve
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    // Verify indicator exists
    let indicators = wrapper.findAll('.flash-card__indicator')
    expect(indicators.length).toBeGreaterThan(0)

    // Then restore
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    indicators = wrapper.findAll('.flash-card__indicator')
    indicators.forEach((indicator) => {
      expect(indicator.isVisible()).toBe(false)
    })
  })

  it('should not emit complete event when restoring', async () => {
    // First approve to change state
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    const completeEventsCount = wrapper.emitted('complete')?.length || 0

    // Then restore
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    // Should not emit new complete events
    expect(wrapper.emitted('complete')?.length).toBe(completeEventsCount)
  })

  it('should work when dragging is disabled', async () => {
    const disabledWrapper = mount(FlashCard, {
      props: {
        threshold: config.defaultThreshold,
        disableDrag: true,
      },
      slots: {
        default: '<div class="card-content">Test Card</div>',
      },
      global: { stubs: { Transition: false } },
    })

    // Approve and then restore
    disabledWrapper.vm.approve()
    await disabledWrapper.vm.$nextTick()

    disabledWrapper.vm.restore()
    await disabledWrapper.vm.$nextTick()

    const cardElement = disabledWrapper.element as HTMLElement
    expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
  })
})
