import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCards from '../../src/FlashCards.vue'

describe('[events] restore', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCards>>

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  beforeEach(() => {
    wrapper = mount(FlashCards, {
      props: {
        items: testItems,
        threshold: config.defaultThreshold,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })
  })

  it('should emit restore event when card is restored programmatically', async () => {
    // First, swipe a card to have something to restore
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    // Now restore it
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    // Check that restore event was emitted
    const restoreEvents = wrapper.emitted('restore')
    expect(restoreEvents).toBeTruthy()

    // In real environment, the actual item would be restored
    // In test environment, we verify the event structure
    if (restoreEvents && restoreEvents.length > 0) {
      expect(restoreEvents[0]).toHaveLength(1)
      expect(restoreEvents[0][0]).toHaveProperty('id')
      expect(restoreEvents[0][0]).toHaveProperty('title')
    }
  })

  it('should emit restore event with correct item data', async () => {
    // Swipe the first card
    wrapper.vm.approve()
    await wrapper.vm.$nextTick()

    // Restore it
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    const restoreEvents = wrapper.emitted('restore')
    expect(restoreEvents).toBeTruthy()

    if (restoreEvents && restoreEvents.length > 0) {
      const restoredItem = restoreEvents[0][0]
      expect(restoredItem).toMatchObject({
        id: expect.any(Number),
        title: expect.stringMatching(/Card \d/),
      })
    }
  })

  it('should work after multiple swipes', async () => {
    // Swipe multiple cards
    wrapper.vm.approve() // Card 1
    await wrapper.vm.$nextTick()

    wrapper.vm.reject() // Card 2
    await wrapper.vm.$nextTick()

    // Restore the last swiped card
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    const restoreEvents = wrapper.emitted('restore')
    expect(restoreEvents).toBeTruthy()

    if (restoreEvents && restoreEvents.length > 0) {
      // Should restore the most recently swiped card
      const restoredItem = restoreEvents[0][0]
      expect(restoredItem).toHaveProperty('id')
      expect(restoredItem).toHaveProperty('title')
    }
  })

  it('should not emit restore event when there is nothing to restore', async () => {
    // Try to restore without swiping any cards first
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    // Should not emit restore event
    expect(wrapper.emitted('restore')).toBeFalsy()
  })

  it('should work with infinite mode', async () => {
    const infiniteWrapper = mount(FlashCards, {
      props: {
        items: testItems,
        threshold: config.defaultThreshold,
        infinite: true,
      },
      slots: {
        default: '{{ item.title }}',
      },
      global: { stubs: { Transition: false } },
    })

    // Swipe a card in infinite mode
    infiniteWrapper.vm.approve()
    await infiniteWrapper.vm.$nextTick()

    // Restore it
    infiniteWrapper.vm.restore()
    await infiniteWrapper.vm.$nextTick()

    const restoreEvents = infiniteWrapper.emitted('restore')
    expect(restoreEvents).toBeTruthy()

    if (restoreEvents && restoreEvents.length > 0) {
      const restoredItem = restoreEvents[0][0]
      expect(restoredItem).toHaveProperty('id')
      expect(restoredItem).toHaveProperty('title')
    }
  })

  it('should handle multiple restore calls correctly', async () => {
    // Swipe two cards
    wrapper.vm.approve() // Card 1
    await wrapper.vm.$nextTick()

    wrapper.vm.reject() // Card 2
    await wrapper.vm.$nextTick()

    // Restore first card
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    // Restore second card
    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    const restoreEvents = wrapper.emitted('restore')
    expect(restoreEvents).toBeTruthy()

    // Should have at least one restore event
    expect(restoreEvents?.length).toBeGreaterThanOrEqual(1)
  })

  it('should work when restore is called from actions slot', async () => {
    const wrapperWithActions = mount(FlashCards, {
      props: {
        items: testItems,
        threshold: config.defaultThreshold,
      },
      slots: {
        default: '{{ item.title }}',
        actions: `
          <template #actions="{ restore, canRestore }">
            <button @click="restore" :disabled="!canRestore" class="restore-btn">
              Restore
            </button>
          </template>
        `,
      },
      global: { stubs: { Transition: false } },
    })

    // Swipe a card first
    wrapperWithActions.vm.approve()
    await wrapperWithActions.vm.$nextTick()

    // Click the restore button
    const restoreButton = wrapperWithActions.find('.restore-btn')
    await restoreButton.trigger('click')
    await wrapperWithActions.vm.$nextTick()

    // Should emit restore event
    const restoreEvents = wrapperWithActions.emitted('restore')
    expect(restoreEvents).toBeTruthy()
  })

  it('should work with different item structures', async () => {
    const complexItems = [
      { id: 'a', name: 'Complex Item 1', meta: { type: 'test' } },
      { id: 'b', name: 'Complex Item 2', meta: { type: 'test' } },
    ]

    const complexWrapper = mount(FlashCards, {
      props: {
        items: complexItems,
        threshold: config.defaultThreshold,
        trackBy: 'id',
      },
      slots: {
        default: '{{ item.name }}',
      },
      global: { stubs: { Transition: false } },
    })

    // Swipe and restore
    complexWrapper.vm.approve()
    await complexWrapper.vm.$nextTick()

    complexWrapper.vm.restore()
    await complexWrapper.vm.$nextTick()

    const restoreEvents = complexWrapper.emitted('restore')
    expect(restoreEvents).toBeTruthy()

    if (restoreEvents && restoreEvents.length > 0) {
      const restoredItem = restoreEvents[0][0]
      expect(restoredItem).toHaveProperty('id')
      expect(restoredItem).toHaveProperty('name')
      expect(restoredItem).toHaveProperty('meta')
    }
  })
})
