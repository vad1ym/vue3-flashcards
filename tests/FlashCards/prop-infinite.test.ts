import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCards from '../../src/FlashCards.vue'

describe('[props] infinite', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCards>>

  const testItems = [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ]

  describe('with infinite enabled', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: flashCardsDefaults.threshold,
          infinite: true,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should render cards in infinite mode', async () => {
      const activeCard = wrapper.find('.flashcards__card--active')
      expect(activeCard.exists()).toBe(true)
      expect(activeCard.text()).toContain('Card 1')
    })

    it('should emit events correctly in infinite mode', async () => {
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')?.[0]).toEqual([testItems[0]])
    })

    it('should handle multiple approvals in infinite mode', async () => {
      // Approve all cards
      for (let i = 0; i < 3; i++) {
        wrapper.vm.approve()
        await wrapper.vm.$nextTick()
      }

      // Should have emitted all approve events
      const approveEvents = wrapper.emitted('approve')
      expect(approveEvents).toHaveLength(3)
      expect(approveEvents?.[0]).toEqual([testItems[0]])
      expect(approveEvents?.[1]).toEqual([testItems[1]])
      expect(approveEvents?.[2]).toEqual([testItems[2]])
    })
  })

  describe('with infinite disabled', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          threshold: flashCardsDefaults.threshold,
          infinite: false,
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
      // Approve all cards
      for (let i = 0; i < 3; i++) {
        wrapper.vm.approve()
        await wrapper.vm.$nextTick()
      }

      // Should show empty state
      const emptyState = wrapper.find('.flashcards-empty-state')
      expect(emptyState.exists()).toBe(true)
    })
  })
})
