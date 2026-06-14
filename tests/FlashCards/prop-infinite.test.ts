import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[props] loop', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCards>>

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  describe('with loop enabled', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          swipeThreshold: flashCardsDefaults.swipeThreshold,
          loop: true,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should render cards in loop mode', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.exists()).toBe(true)
      expect(activeCard.text()).toContain('Card 1')
    })

    it('should emit events correctly in loop mode', async () => {
      wrapper.vm.swipeRight()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('swipeRight')).toBeTruthy()
      expect(wrapper.emitted('swipeRight')?.[0]).toEqual([testItems[0]])
    })

    it('should handle multiple approvals in loop mode', async () => {
      // SwipeRight all cards
      for (let i = 0; i < 3; i++) {
        wrapper.vm.swipeRight()
        await wrapper.vm.$nextTick()
      }

      // Should have emitted all swipeRight events
      const swipeRightEvents = wrapper.emitted('swipeRight')
      expect(swipeRightEvents).toHaveLength(3)
      expect(swipeRightEvents?.[0]).toEqual([testItems[0]])
      expect(swipeRightEvents?.[1]).toEqual([testItems[1]])
      expect(swipeRightEvents?.[2]).toEqual([testItems[2]])
    })
  })

  describe('with loop disabled', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          swipeThreshold: flashCardsDefaults.swipeThreshold,
          loop: false,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should render cards in finite mode', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.exists()).toBe(true)
      expect(activeCard.text()).toContain('Card 1')
    })

    it('should show empty state after all cards are processed', async () => {
      // SwipeRight all cards
      for (let i = 0; i < 3; i++) {
        wrapper.vm.swipeRight()
        await wrapper.vm.$nextTick()
      }

      // Should show empty state
      const emptyState = wrapper.find('.flashcards-empty-state')
      expect(emptyState.exists()).toBe(true)
    })
  })
})
