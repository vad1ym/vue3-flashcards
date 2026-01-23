# Basic Concepts

Understanding the core concepts of Vue3 Flashcards.

## Items Array

The `items` prop accepts an array of objects. Each object represents a card:

```typescript
const cards = ref([
  { id: 1, title: 'Card 1', content: '...' },
  { id: 2, title: 'Card 2', content: '...' },
])
```

Use `itemKey` to specify a unique identifier (defaults to `id`).

## Card Lifecycle

```
current → dragging → swiped → (optional: restored)
```

- **current**: Card is at the top, ready for interaction
- **dragging**: User is actively dragging the card
- **swiped**: Card has been swiped and removed from stack
- **restored**: Card is brought back to the stack (via `restore()` method)

## Event Flow

```
dragstart → dragmove → dragend → swipe*
```

1. `dragstart` - User begins dragging
2. `dragmove` - Card position updates during drag
3. `dragend` - User releases the card
4. `swipe*` - Directional swipe event fires (if threshold passed)

## Slots

- **default** - Card content: `<template #default="{ item }">`
- **top/bottom/left/right** - Directional indicators with delta: `<template #left="{ delta }">`
- **actions** - Action buttons with methods: `<template #actions="{ swipeLeft, swipeRight, restore }">`
- **empty** - Shown when no cards remain

## Directions

Four swipe directions: `left`, `right`, `top`, `bottom`

Control with `swipeDirection` prop:
- `'horizontal'` - left and right (default)
- `'vertical'` - top and bottom
- `['left', 'right', 'top']` - multi-directional
- `['left', 'right', 'top', 'bottom']` - all directions
