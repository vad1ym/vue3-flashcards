import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[slot] activeItemKey', () => {
  let wrapper = mount(FlashCards)

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  beforeEach(() => {
    wrapper = mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: flashCardsDefaults.swipeThreshold,
      },
      slots: {
        default: `<template #default="{ item, activeItemKey }">
          <div class="card-content">{{ item.title }}</div>
          <div class="active-key">{{ activeItemKey }}</div>
        </template>`,
      },
      global: { stubs: { Transition: false } },
    })
  })

  it('should provide activeItemKey in default slot', () => {
    const activeKeyEl = wrapper.find('.active-key')
    expect(activeKeyEl.exists()).toBe(true)
    expect(activeKeyEl.text()).toBe('1')
  })

  it('should update activeItemKey after swipeRight', async () => {
    wrapper.vm.swipeRight()
    await wrapper.vm.$nextTick()

    const activeKeyEl = wrapper.find('.active-key')
    expect(activeKeyEl.text()).toBe('2')
  })

  it('should update activeItemKey after swipeLeft', async () => {
    wrapper.vm.swipeLeft()
    await wrapper.vm.$nextTick()

    const activeKeyEl = wrapper.find('.active-key')
    expect(activeKeyEl.text()).toBe('2')
  })

  it('should keep activeItemKey during restore animation', async () => {
    wrapper.vm.swipeRight()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.active-key').text()).toBe('2')

    wrapper.vm.restore()
    await wrapper.vm.$nextTick()

    // During restore animation, activeItemKey stays at current card
    // It only changes after animation completes
    expect(wrapper.find('.active-key').text()).toBe('2')
  })

  it('should work with custom itemKey prop', async () => {
    const customItems = [
      { uuid: 'a1', title: 'Card A' },
      { uuid: 'b2', title: 'Card B' },
      { uuid: 'c3', title: 'Card C' },
    ]

    const customWrapper = mount(FlashCards, {
      props: {
        items: customItems,
        itemKey: 'uuid',
        swipeThreshold: flashCardsDefaults.swipeThreshold,
      },
      slots: {
        default: `<template #default="{ item, activeItemKey }">
          <div class="card-content">{{ item.title }}</div>
          <div class="active-key">{{ activeItemKey }}</div>
        </template>`,
      },
      global: { stubs: { Transition: false } },
    })

    expect(customWrapper.find('.active-key').text()).toBe('a1')

    customWrapper.vm.swipeRight()
    await customWrapper.vm.$nextTick()

    expect(customWrapper.find('.active-key').text()).toBe('b2')
  })

  it('should handle activeItemKey in loop mode', async () => {
    const loopWrapper = mount(FlashCards, {
      props: {
        items: testItems,
        swipeThreshold: flashCardsDefaults.swipeThreshold,
        loop: true,
      },
      slots: {
        default: `<template #default="{ item, activeItemKey }">
          <div class="card-content">{{ item.title }}</div>
          <div class="active-key">{{ activeItemKey }}</div>
        </template>`,
      },
      global: { stubs: { Transition: false } },
    })

    expect(loopWrapper.find('.active-key').text()).toBe('1')

    // Swipe through all cards
    loopWrapper.vm.swipeRight()
    await loopWrapper.vm.$nextTick()
    expect(loopWrapper.find('.active-key').text()).toBe('2')

    loopWrapper.vm.swipeRight()
    await loopWrapper.vm.$nextTick()
    expect(loopWrapper.find('.active-key').text()).toBe('3')

    loopWrapper.vm.swipeRight()
    await loopWrapper.vm.$nextTick()

    // Swiping the last card completes the cycle: the deck rewinds immediately and
    // the active card loops back to the first one — even while the last card's
    // fly-out is still in flight (it now belongs to the previous, stale cycle).
    expect(loopWrapper.find('.active-key').text()).toBe('1')
  })

  it('should show activeItemKey for last card when all cards are processed (no loop)', async () => {
    wrapper.vm.swipeRight()
    await wrapper.vm.$nextTick()
    wrapper.vm.swipeRight()
    await wrapper.vm.$nextTick()

    // After processing 2 cards, we should be at card 3
    const activeKeyEl = wrapper.find('.active-key')
    expect(activeKeyEl.text()).toBe('3')
  })
})
