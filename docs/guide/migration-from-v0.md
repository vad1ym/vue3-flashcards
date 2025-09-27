# Migration from v0.x to v1.0

This guide helps you upgrade from any v0.x version to v1.0.0.

## Breaking Changes Overview

Vue3 Flashcards v1.0.0 introduces several breaking changes to improve API consistency and add new features.

## Prop Renames

The following props have been renamed for better clarity:

### FlashCards Component

| **v0.x Prop** | **v1.0 Prop** | **Change Required** |
|---------------|---------------|---------------------|
| `trackBy` | `itemKey` | Rename the prop |
| `threshold` | `swipeThreshold` | Rename the prop |
| `maxDraggingX` | `maxDragX` | Rename the prop |
| `maxDraggingY` | `maxDragY` | Rename the prop |
| `infinite` | `loop` | Rename the prop |
| `virtualBuffer` | `renderLimit` | Rename the prop |

### Migration Steps

**Step 1: Update Component Props**

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

<!-- ✅ v1.0 -->
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

**Step 2: Update Global Configuration**

If you're using the Vue plugin or Nuxt module:

```typescript
// ❌ v0.x
app.use(FlashCardsPlugin, {
  flashCards: {
    threshold: 150,
    infinite: true,
    virtualBuffer: 5,
  }
})

// ✅ v1.0
app.use(FlashCardsPlugin, {
  flashCards: {
    swipeThreshold: 150,
    loop: true,
    renderLimit: 5,
  }
})
```

```typescript
// ❌ v0.x nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue3-flashcards/nuxt'],
  flashcards: {
    threshold: 150,
    infinite: true,
    virtualBuffer: 5,
  }
})

// ✅ v1.0 nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue3-flashcards/nuxt'],
  flashcards: {
    swipeThreshold: 150,
    loop: true,
    renderLimit: 5,
  }
})
```

## New Features Available

### Vertical Swipe Direction

v1.0 introduces the new `swipeDirection` prop:

```vue
<!-- Horizontal swiping (default) -->
<FlashCards :items="cards" swipe-direction="horizontal" />

<!-- Vertical swiping (new in v1.0) -->
<FlashCards :items="cards" swipe-direction="vertical" />
```

### Enhanced Actions Slot

The `actions` slot now includes an `isStart` property:

```vue
<!-- v1.0 enhanced actions slot -->
<template #actions="{ approve, reject, restore, reset, isEnd, isStart, canRestore }">
  <button :disabled="isStart || !canRestore" @click="restore">
    Restore
  </button>
</template>
```

## Behavior Changes

### Reset Method

The `reset()` method now ignores the `waitAnimationEnd` prop for more reliable reset behavior. No code changes required.

### Text Selection

Text selection is now automatically prevented during drag interactions when drag is enabled. No code changes required.

## Need Help?

If you encounter any issues during migration:

- Check the [API Reference](/api/flashcards) for complete prop documentation
- Review the [examples](/examples) for updated usage patterns
- [Open an issue](https://github.com/vad1ym/vue3-flashcards/issues) if you find any migration problems
