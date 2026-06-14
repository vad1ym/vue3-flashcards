import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

// Regression: after a RESTORE animation finishes, the card keeps the same vnode
// key (so it's the same element) and becomes draggable again. The restore ran
// with `fill: 'forwards'`, whose lingering transform would override the inline
// `translate3D` driven by drag position — freezing the card in the center while
// only the inner rotation child still moved. The fix cancels the fill once a
// restoring flight finishes, handing control back to the drag.

interface FakeAnimation {
  finished: Promise<unknown>
  cancel: ReturnType<typeof vi.fn>
  finish: () => void
  play: () => void
  pause: () => void
}

describe('restore: card is draggable after the restore animation finishes', () => {
  let wrapper: VueWrapper<any>
  let created: FakeAnimation[]
  let originalAnimate: typeof Element.prototype.animate

  beforeEach(() => {
    created = []
    originalAnimate = Element.prototype.animate
    // Wrap the JSDOM fake so we can capture each animation, spy on cancel(), and
    // drive .finish() to simulate the restore completing.
    Element.prototype.animate = function (this: Element) {
      let resolveFinished!: (value: unknown) => void
      let rejectFinished!: (reason: unknown) => void
      const anim: FakeAnimation = {
        finished: new Promise((resolve, reject) => {
          resolveFinished = resolve
          rejectFinished = reject
        }),
        cancel: vi.fn(() => {
          const err = new Error('The user aborted a request.')
          err.name = 'AbortError'
          rejectFinished(err)
        }),
        finish: () => resolveFinished(anim),
        play: () => {},
        pause: () => {},
      }
      anim.finished.catch(() => {})
      created.push(anim)
      return anim as unknown as Animation
    } as any
  })

  afterEach(() => {
    Element.prototype.animate = originalAnimate
  })

  it('releases the forwards-fill (cancels) when a restore animation finishes', async () => {
    wrapper = mount(FlashCard, {
      props: {
        flight: { type: 'left', isRestoring: true },
      },
      slots: { default: '<div class="card-content">Test Card</div>' },
    })

    await wrapper.vm.$nextTick()
    expect(created).toHaveLength(1)

    const anim = created[0]
    expect(anim.cancel).not.toHaveBeenCalled()

    // Restore animation completes.
    anim.finish()
    await anim.finished.catch(() => {})
    await wrapper.vm.$nextTick()

    // Fill must be released so the inline transform can take over again.
    expect(anim.cancel).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('animationend')).toBeTruthy()
  })

  it('moves the card on drag (not just rotation) after restore finishes', async () => {
    wrapper = mount(FlashCard, {
      props: {
        flight: { type: 'left', isRestoring: true },
      },
      slots: { default: '<div class="card-content">Test Card</div>' },
    })

    await wrapper.vm.$nextTick()
    const anim = created[0]
    anim.finish()
    await anim.finished.catch(() => {})
    await wrapper.vm.$nextTick()

    // Clear the animation prop, mirroring the parent removing the record once the
    // restored card returns to `pending`.
    await wrapper.setProps({ flight: undefined })

    const cardElement = wrapper.find('.flash-card')
    new DragSimulator(cardElement).dragRightToThreshold(0.5)
    await wrapper.vm.$nextTick()

    // The outer element must translate with the drag, not sit at center.
    const style = cardElement.attributes('style') ?? ''
    expect(style).toContain('translate3D')
    expect(style).not.toContain('translate3D(0px, 0px, 0)')
  })

  it('does NOT cancel a swipe-out fill when it finishes (card must stay off-screen)', async () => {
    wrapper = mount(FlashCard, {
      props: {
        flight: { type: 'left', isRestoring: false },
      },
      slots: { default: '<div class="card-content">Test Card</div>' },
    })

    await wrapper.vm.$nextTick()
    const anim = created[0]

    anim.finish()
    await anim.finished.catch(() => {})
    await wrapper.vm.$nextTick()

    // Swipe-out fill is preserved (parent commits/removes the card); only restore
    // releases its fill.
    expect(anim.cancel).not.toHaveBeenCalled()
    expect(wrapper.emitted('animationend')).toBeTruthy()
  })
})
