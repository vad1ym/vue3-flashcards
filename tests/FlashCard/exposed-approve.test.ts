import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'

describe('[exposed] approve', () => {
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

  it('should emit complete event with approved=true', async () => {
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('complete')).toBeTruthy()
    const emittedEvent = wrapper.emitted('complete')![0]
    expect(emittedEvent[0]).toBe(true) // approved = true
  })

  it('should have approve indicator element available', async () => {
    const approveIndicator = wrapper.find('.flash-card__indicator')
    expect(approveIndicator.exists()).toBe(true)
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

    customWrapper.vm.approve()
    await customWrapper.vm.$nextTick()

    expect(customWrapper.emitted('complete')?.[0][0]).toBe(true)
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

    disabledWrapper.vm.approve()
    await disabledWrapper.vm.$nextTick()

    expect(disabledWrapper.emitted('complete')).toBeTruthy()
    expect(disabledWrapper.emitted('complete')?.[0][0]).toBe(true)
  })
})
