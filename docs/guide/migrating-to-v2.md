# Migrating to v2

Vue3 Flashcards v2 drops the legacy `approve`/`reject` API in favor of the
directional API (`swipeLeft` / `swipeRight` / `swipeTop` / `swipeBottom`). This
guide walks through everything you need to change.

[[toc]]

## Overview

The directional API has been the recommended way to work with FlashCards since
v1. In v2 the old `approve`/`reject` aliases are **removed entirely** — events,
slots, and exposed methods. Everything they did has a direct directional
equivalent, so migration is a mechanical rename.

| Concept | v1 (removed) | v2 |
|---|---|---|
| Approve | `approve` | `swipeRight` (or `swipeTop`) |
| Reject | `reject` | `swipeLeft` (or `swipeBottom`) |

> [!TIP]
> If you were already using the directional API, there is nothing to change.

## Events

Replace `@approve` / `@reject` listeners with directional events.

```vue
<!-- ❌ v1 -->
<FlashCards
  :items="cards"
  @approve="onApprove"
  @reject="onReject"
/>

<!-- ✅ v2 -->
<FlashCards
  :items="cards"
  @swipe-right="onApprove"
  @swipe-left="onReject"
/>
```

The `dragmove` event no longer emits the `'approve'` / `'reject'` type aliases.
Its `type` is now strictly directional: `'top'`, `'left'`, `'right'`,
`'bottom'`, or `null`.

```vue
<!-- ❌ v1: type could be 'approve' | 'reject' -->
<FlashCards @dragmove="(item, type, delta) => {
  if (type === 'approve') { /* ... */ }
}" />

<!-- ✅ v2: type is 'top' | 'left' | 'right' | 'bottom' | null -->
<FlashCards @dragmove="(item, type, delta) => {
  if (type === 'right') { /* ... */ }
}" />
```

## Slots

Replace the `#approve` / `#reject` indicator slots with directional slots.

```vue
<!-- ❌ v1 -->
<FlashCards :items="cards">
  <template #approve="{ delta }">
    <div :style="{ opacity: delta }">❤️ Like</div>
  </template>
  <template #reject="{ delta }">
    <div :style="{ opacity: delta }">❌ Nope</div>
  </template>
</FlashCards>

<!-- ✅ v2 -->
<FlashCards :items="cards">
  <template #right="{ delta }">
    <div :style="{ opacity: delta }">❤️ Like</div>
  </template>
  <template #left="{ delta }">
    <div :style="{ opacity: delta }">❌ Nope</div>
  </template>
</FlashCards>
```

The `actions` slot no longer exposes `approve` / `reject`. Use the directional
methods instead.

```vue
<!-- ❌ v1 -->
<template #actions="{ approve, reject, restore }">
  <button @click="reject">❌</button>
  <button @click="restore">↩️</button>
  <button @click="approve">❤️</button>
</template>

<!-- ✅ v2 -->
<template #actions="{ swipeRight, swipeLeft, restore }">
  <button @click="swipeLeft">❌</button>
  <button @click="restore">↩️</button>
  <button @click="swipeRight">❤️</button>
</template>
```

## Exposed methods

Replace the `approve()` / `reject()` template-ref methods with directional ones.

```ts
// ❌ v1
flashcardsRef.value.approve()
flashcardsRef.value.reject()

// ✅ v2
flashcardsRef.value.swipeRight()
flashcardsRef.value.swipeLeft()
```

Unlike the old aliases, the directional methods work in every mode (preset and
array `swipeDirection`), so the `console.warn` you may have seen in array mode is
gone.

## Animations: CSS keyframes → Web Animations API

In v2 the swipe-out and restore animations are driven by the
[Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
(`element.animate()`) instead of CSS `@keyframes`. The internal `.ghost` clone is
gone, and so are the `.flash-card-animation--*` CSS classes.

**If you used the default animations, nothing changes** — they look the same.

**If you overrode the animations with CSS** (targeting
`.flash-card-animation--right`, `--left-restore`, etc.), those classes no longer
exist. Move your custom animation to the new `animationKeyframes` prop — a
function returning the off-screen fly-out frame (the library reverses it for
restore):

```vue
<!-- ❌ v1: CSS keyframes targeting internal classes -->
<FlashCards :items="cards" class="fast-rotate" />

<style>
.fast-rotate .flash-card-animation--right {
  animation: fastSpin 0.4s linear forwards !important;
}
@keyframes fastSpin {
  to { transform: translateX(300px) rotate(360deg); opacity: 0; }
}
</style>
```

```vue
<!-- ✅ v2: animationKeyframes prop -->
<FlashCards
  :items="cards"
  :animation-keyframes="animationKeyframes"
  :animation-duration="400"
  animation-easing="linear"
/>

<script setup lang="ts">
import type { AnimationContext } from 'vue3-flashcards'

function animationKeyframes(ctx: AnimationContext): Keyframe {
  // Describe ONLY the fly-out (the off-screen end frame), from center. The
  // library starts it from the drag-release point and plays it reversed for
  // restore — you don't write either.
  const x = ctx.type === 'left' ? -300 : 300
  return { transform: `translateX(${x}px) rotate(360deg)`, opacity: 0 }
}
</script>
```

> [!TIP]
> Timing moved from the CSS `animation` shorthand to the `animationDuration`
> (ms) and `animationEasing` props. The full API, plus how to start a swipe from
> the drag-release point, is documented in
> [Transition Effects](../advanced/transition-effects.md).

## Deprecated API

The following APIs are **removed in v2**. They are listed here for reference
while you migrate. More breaking changes are planned for upcoming v2 releases —
this section will track them.

| Removed | Replacement |
|---|---|
| `approve` event | `swipeRight` / `swipeTop` event |
| `reject` event | `swipeLeft` / `swipeBottom` event |
| `dragmove` type `'approve'` / `'reject'` | `'right'` / `'left'` / `'top'` / `'bottom'` |
| `#approve` slot | `#right` / `#top` slot |
| `#reject` slot | `#left` / `#bottom` slot |
| `actions` slot `approve` / `reject` | `actions` slot `swipeRight` / `swipeLeft` |
| `approve()` exposed method | `swipeRight()` / `swipeTop()` |
| `reject()` exposed method | `swipeLeft()` / `swipeBottom()` |
| `.flash-card-animation--*` CSS keyframe classes | `animationKeyframes` prop (Web Animations API) |

## Migrating from v0.x

If you are coming from a v0.x release, first apply the prop renames below, then
follow the directional migration above.

### Prop renames

| **v0.x Prop** | **v1.0+ Prop** | **Change Required** |
|---------------|----------------|---------------------|
| `trackBy` | `itemKey` | Rename the prop |
| `threshold` | `swipeThreshold` | Rename the prop |
| `maxDraggingX` | `maxDragX` | Rename the prop |
| `maxDraggingY` | `maxDragY` | Rename the prop |
| `infinite` | `loop` | Rename the prop |
| `virtualBuffer` | `renderLimit` | Rename the prop |

```vue
<!-- ❌ v0.x -->
<FlashCards
  :items="cards"
  track-by="id"
  :threshold="150"
  :max-dragging-x="200"
  :max-dragging-y="100"
  :infinite="true"
  :virtual-buffer="5"
/>

<!-- ✅ v1.0+ -->
<FlashCards
  :items="cards"
  item-key="id"
  :swipe-threshold="150"
  :max-drag-x="200"
  :max-drag-y="100"
  :loop="true"
  :render-limit="5"
/>
```

The same renames apply to the Vue plugin and Nuxt module configuration:

```typescript
// ❌ v0.x
app.use(FlashCardsPlugin, {
  flashCards: { threshold: 150, infinite: true, virtualBuffer: 5 }
})

// ✅ v1.0+
app.use(FlashCardsPlugin, {
  flashCards: { swipeThreshold: 150, loop: true, renderLimit: 5 }
})
```

## Need Help?

If you encounter any issues during migration:

- Check the [API Reference](/api/flashcards) for complete prop documentation
- Review the [examples](/examples/) for updated usage patterns
- [Open an issue](https://github.com/vad1ym/vue3-flashcards/issues) if you find any migration problems
