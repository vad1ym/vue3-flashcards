---
outline: deep
---

<script setup>
import TransitionEffectsUsage from '../../example/transition-effects/index.vue'
</script>

# Transitions

<Badge>Advanced</Badge>

Custom swipe-out and restore animations via the `animation` prop
(Web Animations API).

## Demo

<ClientOnly>
  <TransitionEffectsUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/transition-effects/index.vue [index.vue]
<<< ../../example/transition-effects/TransitionCard.vue [TransitionCard.vue]
:::

## Key Concepts

- **`animation`**: a single object prop — `{ keyframes, duration, easing }` (all optional)
- **`animation.keyframes`**: a function returning the off-screen fly-out frame
- **`AnimationContext`**: `type`, `direction`, `maxRotation`
- **Per-direction styles**: branch on `ctx.type` for left/right/top/bottom
- **One frame, both ways**: the library starts the swipe from the drag-release point and plays it reversed for restore
- **Timing**: `animation.duration` / `animation.easing`

## Common Patterns

```ts
const animation = {
  duration: 400,
  keyframes(ctx) {
    const x = ctx.type === 'left' ? -300 : 300

    // Just the off-screen end frame:
    return { transform: `translateX(${x}px) rotate(360deg)`, opacity: 0 }
    // Scale to zero:  { transform: `translateX(${x}px) scale(0)`, opacity: 0 }
    // 3D flip:        { transform: `translateX(${x}px) rotateY(180deg)`, opacity: 0 }
  },
}
```

## Related

- [Transition Effects](../advanced/transition-effects.md)
