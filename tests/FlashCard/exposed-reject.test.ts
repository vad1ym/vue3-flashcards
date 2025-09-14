import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'

describe('[exposed] reject', () => {
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

  it('should emit complete event with approved=false', async () => {
    wrapper.vm.reject()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('complete')).toBeTruthy()
    const emittedEvent = wrapper.emitted('complete')![0]
    expect(emittedEvent[0]).toBe(false) // approved = false
  })

  it('should have reject indicator element available', async () => {
    const rejectIndicator = wrapper.find('.flash-card__indicator')
    expect(rejectIndicator.exists()).toBe(true)
  })

  it('should work with custom threshold', async () => {
    const customThreshold = 200
    const customWrapper = mount(FlashCard, {
      props: {
        threshold: customThreshold,
      },
      slots: {
        default: '<div class="card-content">Test Card</div>',
      },
      global: { stubs: { Transition: false } },
    })

    customWrapper.vm.reject()
    await customWrapper.vm.$nextTick()

    expect(customWrapper.emitted('complete')?.[0][0]).toBe(false)
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

    disabledWrapper.vm.reject()
    await disabledWrapper.vm.$nextTick()

    expect(disabledWrapper.emitted('complete')).toBeTruthy()
    expect(disabledWrapper.emitted('complete')?.[0][0]).toBe(false)
  })
})
