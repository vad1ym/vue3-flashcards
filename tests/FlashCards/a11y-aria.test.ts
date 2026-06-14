import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

const testItems = [
  { id: 1, title: 'Card 1' },
  { id: 2, title: 'Card 2' },
]

function mountDeck(props: Record<string, unknown> = {}) {
  return mount(FlashCards, {
    props: {
      items: testItems,
      swipeThreshold: flashCardsDefaults.swipeThreshold,
      ...props,
    },
    slots: { default: '{{ item.title }}' },
    global: { stubs: { Transition: false } },
  })
}

describe('[a11y] ARIA roles + live region', () => {
  it('adds group role and roledescription to the deck by default', () => {
    const wrapper = mountDeck()
    const deck = wrapper.find('.flashcards')
    expect(deck.attributes('role')).toBe('group')
    expect(deck.attributes('aria-roledescription')).toBe('Card deck')
    expect(deck.attributes('tabindex')).toBe('0')
  })

  it('renders a polite live region by default', () => {
    const wrapper = mountDeck()
    const live = wrapper.find('[role="status"]')
    expect(live.exists()).toBe(true)
    expect(live.attributes('aria-live')).toBe('polite')
    expect(live.attributes('aria-atomic')).toBe('true')
  })

  it('honors assertive liveMode', () => {
    const wrapper = mountDeck({ a11y: { liveMode: 'assertive' } })
    expect(wrapper.find('[role="status"]').attributes('aria-live')).toBe('assertive')
  })

  it('announces a swipe', async () => {
    const wrapper = mountDeck()
    wrapper.vm.swipeRight()
    await wrapper.vm.$nextTick()
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="status"]').text()).toContain('right')
  })

  it('labels the active card with its position', () => {
    const wrapper = mountDeck()
    const active = wrapper.find('[data-active-card="true"]')
    expect(active.exists()).toBe(true)
    expect(active.attributes('aria-label')).toContain('Card 1 of 2')
  })

  it('marks non-active cards aria-hidden', () => {
    const wrapper = mountDeck()
    const hidden = wrapper.findAll('.flashcards__card-wrapper').filter(w => w.attributes('aria-hidden') === 'true')
    expect(hidden.length).toBeGreaterThan(0)
  })

  it('omits all ARIA wiring when a11y is false', () => {
    const wrapper = mountDeck({ a11y: false })
    const deck = wrapper.find('.flashcards')
    expect(deck.attributes('role')).toBeUndefined()
    expect(deck.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('localizes labels', () => {
    const wrapper = mountDeck({ a11y: { labels: { deck: 'Колода', card: 'Карточка' } } })
    expect(wrapper.find('.flashcards').attributes('aria-roledescription')).toBe('Колода')
    expect(wrapper.find('[data-active-card="true"]').attributes('aria-label')).toContain('Карточка')
  })

  it('uses a custom announce() builder', async () => {
    const wrapper = mountDeck({
      a11y: { announce: () => 'custom message' },
    })
    wrapper.vm.swipeRight()
    await wrapper.vm.$nextTick()
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="status"]').text()).toBe('custom message')
  })
})
