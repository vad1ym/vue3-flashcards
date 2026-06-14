import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

const testItems = [
  { id: 1, title: 'Card 1' },
  { id: 2, title: 'Card 2' },
  { id: 3, title: 'Card 3' },
]

function mountDeck(props: Record<string, unknown> = {}) {
  return mount(FlashCards, {
    attachTo: document.body,
    props: {
      items: testItems,
      swipeThreshold: flashCardsDefaults.swipeThreshold,
      ...props,
    },
    slots: { default: '{{ item.title }}' },
    global: { stubs: { Transition: false } },
  })
}

describe('[a11y] keyboard navigation', () => {
  let wrapper = mountDeck()

  beforeEach(() => {
    wrapper = mountDeck()
  })

  it('swipes right on ArrowRight (horizontal default)', async () => {
    await wrapper.find('.flashcards').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeRight')).toBeTruthy()
    expect(wrapper.emitted('swipeRight')?.[0]).toEqual([testItems[0]])
  })

  it('swipes left on ArrowLeft', async () => {
    await wrapper.find('.flashcards').trigger('keydown', { key: 'ArrowLeft' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeLeft')?.[0]).toEqual([testItems[0]])
  })

  it('ignores arrow keys for disabled directions', async () => {
    // Horizontal-only deck: up/down do nothing.
    await wrapper.find('.flashcards').trigger('keydown', { key: 'ArrowUp' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeTop')).toBeFalsy()
  })

  it('maps arrows to enabled directions for a vertical deck', async () => {
    const v = mountDeck({ swipeDirection: 'vertical' })
    await v.find('.flashcards').trigger('keydown', { key: 'ArrowUp' })
    await v.vm.$nextTick()
    expect(v.emitted('swipeTop')?.[0]).toEqual([testItems[0]])
  })

  it('enter triggers the primary positive action (right)', async () => {
    await wrapper.find('.flashcards').trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeRight')?.[0]).toEqual([testItems[0]])
  })

  it('backspace restores the previous card', async () => {
    // Swipe one out first.
    await wrapper.find('.flashcards').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    await wrapper.find('.flashcards').trigger('keydown', { key: 'Backspace' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('restore')).toBeTruthy()
  })

  it('does nothing when a11y is disabled', async () => {
    const off = mountDeck({ a11y: false })
    await off.find('.flashcards').trigger('keydown', { key: 'ArrowRight' })
    await off.vm.$nextTick()
    expect(off.emitted('swipeRight')).toBeFalsy()
  })

  it('does nothing when keyboard is disabled but a11y stays on', async () => {
    const off = mountDeck({ a11y: { keyboard: false } })
    await off.find('.flashcards').trigger('keydown', { key: 'ArrowRight' })
    await off.vm.$nextTick()
    expect(off.emitted('swipeRight')).toBeFalsy()
    // Roles still present.
    expect(off.find('.flashcards').attributes('role')).toBe('group')
  })
})

describe('[a11y] confirm-on-key flow', () => {
  it('first arrow peeks, second matching arrow confirms', async () => {
    const wrapper = mountDeck({ a11y: { confirmOnKey: true } })
    const deck = wrapper.find('.flashcards')

    await deck.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    // No swipe yet — only a peek.
    expect(wrapper.emitted('swipeRight')).toBeFalsy()

    await deck.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeRight')?.[0]).toEqual([testItems[0]])
  })

  it('enter confirms a pending peek', async () => {
    const wrapper = mountDeck({ a11y: { confirmOnKey: true } })
    const deck = wrapper.find('.flashcards')

    await deck.trigger('keydown', { key: 'ArrowLeft' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeLeft')).toBeFalsy()

    await deck.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeLeft')?.[0]).toEqual([testItems[0]])
  })

  it('escape cancels a pending peek', async () => {
    const wrapper = mountDeck({ a11y: { confirmOnKey: true } })
    const deck = wrapper.find('.flashcards')

    await deck.trigger('keydown', { key: 'ArrowRight' })
    await deck.trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('swipeRight')).toBeFalsy()
  })
})
