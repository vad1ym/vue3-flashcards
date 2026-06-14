import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useDragSetup } from '../../src/utils/useDragSetup'

// Mount a host so the composable's onMounted/onUnmounted have a component
// context. Returns the live composable API plus the options ref so a test can
// flip `disableDrag` / `initialPosition` between calls.
function mountDrag(initial: Record<string, unknown> = {}) {
  const options = ref<Record<string, unknown>>(initial)
  let api!: ReturnType<typeof useDragSetup>

  const Host = defineComponent({
    setup() {
      const el = ref<HTMLDivElement | null>(null)
      api = useDragSetup(el, () => options.value as any)
      return () => h('div', { ref: el })
    },
  })

  const wrapper = mount(Host, { attachTo: document.body })
  return { wrapper, options, api: () => api }
}

describe('useDragSetup', () => {
  it('setupInteract({ applyInitialPosition: false }) leaves the current position untouched', () => {
    // Regression: in loop mode a card finishes its swipe-out and is reused as a
    // background card. The `disableDrag` watcher re-runs setup to (de)attach
    // listeners — it must NOT re-stamp `initialPosition`, or the reused card
    // snaps back to its stale release offset and stays translated off-center.
    const { api, options } = mountDrag({ initialPosition: { x: 165, y: 0 } })

    // Simulate the card having returned to rest (e.g. after restore()).
    api().restore()
    expect(api().position.x).toBe(0)

    // The stale fly-out offset is still in `options.initialPosition`. A
    // listener-only re-subscribe must not reapply it.
    api().setupInteract({ applyInitialPosition: false })
    expect(api().position.x).toBe(0)
    expect(api().position.y).toBe(0)

    // The explicit (mount-style) setup, by contrast, DOES apply it.
    options.value = { initialPosition: { x: 42, y: 0 } }
    api().setupInteract()
    expect(api().position.x).toBe(42)
  })
})
