# Transition Effects

Customize the swipe-out and restore animations with the Web Animations API.

> [!NOTE]
> **Changed in v2.** Animations are now driven by the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
> (`element.animate()`), not CSS keyframes. Override them with the `animation`
> prop — its `keyframes` field is a function returning the off-screen fly-out
> frame. The old `.flash-card-animation--*` CSS classes no longer exist. See
> [Migrating to v2](../guide/migrating-to-v2.md#animations-css-keyframes-web-animations-api).

## How it works

When a card flies out (swipe) or animates back in (restore), the component calls
`element.animate(keyframes, options)` on the **real** card element. By default it
uses a built-in keyframe set that reproduces the classic Tinder-style fly-out.
Pass the `animation` prop to replace it. It's a single object with three optional
fields:

| Field | Type | Default | What it does |
|---|---|---|---|
| `keyframes` | `(ctx) => Keyframe \| Keyframe[]` | built-in fly-out | The off-screen end frame(s) |
| `duration` | `number` (ms) | `400` | How long the fly-out / restore takes |
| `easing` | `string` | `cubic-bezier(0.4, 0, 0.2, 1)` | Any CSS easing string |

```vue
<template>
  <FlashCards :items="cards" :animation="animation">
    <template #default="{ item }">
      <!-- card content -->
    </template>
  </FlashCards>
</template>

<script setup lang="ts">
import type { AnimationContext } from 'vue3-flashcards'

const animation = {
  duration: 400,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Just the off-screen end frame. That's it.
  keyframes: (ctx: AnimationContext): Keyframe => {
    const x = ctx.type === 'left' ? -320 : 320
    return { transform: `translateX(${x}px) rotate(15deg)`, opacity: 0 }
  },
}
</script>
```

## The keyframes callback

`animation.keyframes` describes **only how the card flies out**, from center —
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

const animation = {
  keyframes(ctx) {
    // Custom bottom-swipe; default everything else.
    if (ctx.type === 'bottom')
      return { transform: 'translateY(400px)', opacity: 0 }
    return defaultAnimationKeyframes(ctx)
  },
}
```

## Timing

`animation.duration` (ms) and `animation.easing` apply to every flight. They map
directly to the WAAPI options `duration` and `easing`. Both are optional — omit
the whole `animation` prop to keep the built-in defaults.

```vue
<FlashCards :items="cards" :animation="{ duration: 250, easing: 'ease-out' }" />
```

## Common patterns

Each is the off-screen end frame returned from `animation.keyframes` (with
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
// :animation="{ keyframes, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }"
```

**See:** [Examples - Transitions](../examples/transitions.md)
