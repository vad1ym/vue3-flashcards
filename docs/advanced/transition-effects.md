# Transition Effects

Customize the swipe-out and restore animations with the Web Animations API.

> [!NOTE]
> **Changed in v2.** Animations are now driven by the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
> (`element.animate()`), not CSS keyframes. Override them with the
> `animationKeyframes` prop — a function returning the off-screen fly-out frame. The old
> `.flash-card-animation--*` CSS classes no longer exist. See
> [Migrating to v2](../guide/migrating-to-v2.md#animations-css-keyframes-web-animations-api).

## How it works

When a card flies out (swipe) or animates back in (restore), the component calls
`element.animate(keyframes, options)` on the **real** card element. By default it
uses a built-in keyframe set that reproduces the classic Tinder-style fly-out.
Pass `animationKeyframes` to replace it.

```vue
<template>
  <FlashCards
    :items="cards"
    :animation-keyframes="animationKeyframes"
    :animation-duration="400"
    animation-easing="cubic-bezier(0.4, 0, 0.2, 1)"
  >
    <template #default="{ item }">
      <!-- card content -->
    </template>
  </FlashCards>
</template>

<script setup lang="ts">
import type { AnimationContext } from 'vue3-flashcards'

function animationKeyframes(ctx: AnimationContext): Keyframe {
  // Just the off-screen end frame. That's it.
  const x = ctx.type === 'left' ? -320 : 320
  return { transform: `translateX(${x}px) rotate(15deg)`, opacity: 0 }
}
</script>
```

## The callback

`animationKeyframes` describes **only how the card flies out**, from center —
the single off-screen end frame (or an array of frames for a multi-step exit).
The library builds everything else.

```ts
interface AnimationContext {
  /** 'left' | 'right' | 'top' | 'bottom' | 'skip' */
  type: SwipeAction
  /** Directions enabled on the card. */
  direction: Direction[]
  /** maxRotation configured on the card. */
  maxRotation: number
}

type AnimationKeyframes = (ctx: AnimationContext) => Keyframe | Keyframe[]
```

What the library derives for you:

- **Swipe-out** — starts the card at the drag-release point (so a manual swipe
  continues from the finger, not from center) → your fly-out frames.
- **Restore** — plays your fly-out frames **in reverse**, ending at center. You
  never write the restore animation; it's the mirror of the swipe.

So a single end frame like `{ transform: 'translateX(320px)', opacity: 0 }` is a
complete custom animation — both directions and the release-point start come for
free.

### Partial overrides

The built-in `defaultAnimationKeyframes` is exported — wrap it to override only
some directions:

```ts
import { defaultAnimationKeyframes } from 'vue3-flashcards'

function animationKeyframes(ctx) {
  // Custom bottom-swipe; default everything else.
  if (ctx.type === 'bottom')
    return { transform: 'translateY(400px)', opacity: 0 }
  return defaultAnimationKeyframes(ctx)
}
```

## Timing

`animationDuration` (ms) and `animationEasing` apply to every flight. They map
directly to the WAAPI options `duration` and `easing`.

| Prop | Type | Default |
|---|---|---|
| `animationKeyframes` | `(ctx: AnimationContext) => Keyframe \| Keyframe[]` | built-in fly-out |
| `animationDuration` | `number` | `400` |
| `animationEasing` | `string` | `cubic-bezier(0.4, 0, 0.2, 1)` |

## Common patterns

Each is the off-screen end frame returned from `animationKeyframes` (with
`x = ctx.type === 'left' ? -320 : 320`):

```ts
// Fast spin
return { transform: `translateX(${x}px) rotate(720deg)`, opacity: 0 }

// Scale to zero
return { transform: `translateX(${x}px) scale(0)`, opacity: 0 }

// 3D flip
return { transform: `translateX(${x}px) rotateY(180deg) rotateX(45deg)`, opacity: 0 }

// Elastic bounce (pair with an overshoot easing)
return { transform: `translateX(${x}px) scale(1.3) rotate(15deg)`, opacity: 0 }
// animation-easing="cubic-bezier(0.68, -0.55, 0.265, 1.55)"
```

**See:** [Examples - Transitions](../examples/transitions.md)
