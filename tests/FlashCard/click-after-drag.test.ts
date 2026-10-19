import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('click on slot content', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>
  let onClick: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    onClick = vi.fn()
    wrapper = mount(FlashCard, {
      slots: {
        default: () => h('button', { class: 'slot-button', onClick }, 'Click'),
      },
      global: { stubs: { Transition: false } },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
  })

  function clickButton() {
    wrapper.find('.slot-button').element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  }

  it('fires click on a tap (no drag)', () => {
    new DragSimulator(wrapper.element as HTMLElement).dragStart().dragEnd()
    clickButton()

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('fires click when movement stays below dragThreshold', () => {
    new DragSimulator(wrapper.element as HTMLElement).dragStart().dragMove([{ x: 2 }]).dragEnd()
    clickButton()

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire click after a drag that snaps back', () => {
    new DragSimulator(wrapper.element as HTMLElement).dragStart().dragMove([{ x: 40 }]).dragEnd()
    clickButton()

    expect(onClick).not.toHaveBeenCalled()
  })

  it('suppresses only the click right after the drag', async () => {
    new DragSimulator(wrapper.element as HTMLElement).dragStart().dragMove([{ x: 40 }]).dragEnd()
    await new Promise(resolve => setTimeout(resolve, 0))
    clickButton()

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
