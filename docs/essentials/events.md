# Events

Handle swipe interactions and user actions.

## Swipe Events

Fired when a card completes a swipe:

```vue
<FlashCards
  :items="cards"
  @swipe-left="handleLeft"
  @swipe-right="handleRight"
  @swipe-top="handleTop"
  @swipe-bottom="handleBottom"
>
  <!-- ... -->
</FlashCards>
```

Each event receives the swiped item:

```typescript
function handleLeft(item: CardType) {
  console.log('Swiped left:', item)
  // Save to database, update UI, etc.
}
```

## Drag Events

Track drag state in real-time. `dragstart` and `dragend` receive the item;
`dragmove` receives the item, the current direction, and a normalized `delta`:

```vue
<script setup>
import { ref } from 'vue'

const isDragging = ref(false)

// type: 'left' | 'right' | 'top' | 'bottom' | null
// delta: -1 to 1 (how far toward the swipe threshold)
function handleDragMove(item, type, delta) {
  console.log(`dragging ${item.id} toward ${type} (${delta.toFixed(2)})`)
}
</script>

<template>
  <FlashCards
    :items="cards"
    @dragstart="isDragging = true"
    @dragmove="handleDragMove"
    @dragend="isDragging = false"
  >
    <template #default="{ item }">
      <!-- card content -->
    </template>
  </FlashCards>
</template>
```

## Special Events

```vue
<FlashCards
  :items="cards"
  @restore="handleRestore"
  @skip="handleSkip"
  @loop="handleLoop"
>
  <!-- ... -->
</FlashCards>
```

- `restore` - Card is returned to the stack
- `skip` - Card is skipped (no swipe direction)
- `loop` - In loop mode, fired when cycling back

**See:** [API Reference - Events](../api/flashcards.md#events)
