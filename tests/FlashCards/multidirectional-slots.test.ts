import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'

interface TestCard extends Record<string, unknown> {
  id: number
  title: string
}

const testCards: TestCard[] = [
  { id: 1, title: 'Card 1' },
  { id: 2, title: 'Card 2' },
  { id: 3, title: 'Card 3' },
]

describe('[slots] multidirectional slots', () => {
  let wrapper = mount(FlashCards)

  beforeEach(() => {
    wrapper = mount(FlashCards, {
      props: {
        items: testCards,
        swipeThreshold: 100,
      },
      slots: {
        default: `<template #default="{ item }">
          <div class="card">{{ item.title }}</div>
        </template>`,
      },
      global: { stubs: { Transition: false } },
    })
  })

  describe('single direction directional slots', () => {
    it('should render right slot for right swipe', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['right'],
          swipeThreshold: 100,
        },
        slots: {
          default: `<template #default="{ item }">
            <div class="card">{{ item.title }}</div>
          </template>`,
          right: `<template #right="{ item }">
            <div class="right-indicator">RIGHT: {{ item.title }}</div>
          </template>`,
        },
        global: { stubs: { Transition: false } },
      })

      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.right-indicator').exists()).toBe(true)
      expect(wrapper.find('.right-indicator').text()).toContain('Card 1')
    })

    it('should render left slot for left swipe', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['left'],
          swipeThreshold: 100,
        },
        slots: {
          default: `<template #default="{ item }">
            <div class="card">{{ item.title }}</div>
          </template>`,
          left: `<template #left="{ item }">
            <div class="left-indicator">LEFT: {{ item.title }}</div>
          </template>`,
        },
        global: { stubs: { Transition: false } },
      })

      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: -50, y: 0 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.left-indicator').exists()).toBe(true)
      expect(wrapper.find('.left-indicator').text()).toContain('Card 1')
    })

    it('should render top slot for top swipe', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['top'],
          swipeThreshold: 100,
        },
        slots: {
          default: `<template #default="{ item }">
            <div class="card">{{ item.title }}</div>
          </template>`,
          top: `<template #top="{ item }">
            <div class="top-indicator">TOP: {{ item.title }}</div>
          </template>`,
        },
        global: { stubs: { Transition: false } },
      })

      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 0, y: -50 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.top-indicator').exists()).toBe(true)
      expect(wrapper.find('.top-indicator').text()).toContain('Card 1')
    })

    it('should render bottom slot for bottom swipe', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['bottom'],
          swipeThreshold: 100,
        },
        slots: {
          default: `<template #default="{ item }">
            <div class="card">{{ item.title }}</div>
          </template>`,
          bottom: `<template #bottom="{ item }">
            <div class="bottom-indicator">BOTTOM: {{ item.title }}</div>
          </template>`,
        },
        global: { stubs: { Transition: false } },
      })

      const firstCard = wrapper.find('.flashcards__card--active')

      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 0, y: 50 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.bottom-indicator').exists()).toBe(true)
      expect(wrapper.find('.bottom-indicator').text()).toContain('Card 1')
    })
  })

  describe('two directions slots (left and right)', () => {
    it('should render right for right, left for left', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['left', 'right'],
          swipeThreshold: 100,
        },
        slots: {
          default: `<template #default="{ item }">
            <div class="card">{{ item.title }}</div>
          </template>`,
          right: `<template #right="{ item }">
            <div class="right-indicator">RIGHT</div>
          </template>`,
          left: `<template #left="{ item }">
            <div class="left-indicator">LEFT</div>
          </template>`,
        },
        global: { stubs: { Transition: false } },
      })

      const firstCard = wrapper.find('.flashcards__card--active')

      // Test right drag
      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 50, y: 0 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.right-indicator').exists()).toBe(true)

      // Reset and test left drag
      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: -50, y: 0 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.left-indicator').exists()).toBe(true)
    })
  })

  describe('vertical direction slots', () => {
    it('should render top for top, bottom for bottom', async () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testCards,
          swipeDirection: ['top', 'bottom'],
          swipeThreshold: 100,
        },
        slots: {
          default: `<template #default="{ item }">
            <div class="card">{{ item.title }}</div>
          </template>`,
          top: `<template #top="{ item }">
            <div class="top-indicator">TOP</div>
          </template>`,
          bottom: `<template #bottom="{ item }">
            <div class="bottom-indicator">BOTTOM</div>
          </template>`,
        },
        global: { stubs: { Transition: false } },
      })

      const firstCard = wrapper.find('.flashcards__card--active')

      // Test top drag
      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 0, y: -50 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.top-indicator').exists()).toBe(true)

      // Reset and test bottom drag
      new DragSimulator(firstCard.element as HTMLElement)
        .dragStart()
        .dragMove([{ x: 0, y: 50 }])

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.bottom-indicator').exists()).toBe(true)
    })
  })
})
