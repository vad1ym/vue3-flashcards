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
