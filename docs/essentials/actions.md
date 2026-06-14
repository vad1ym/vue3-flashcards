# Actions

Programmatically control cards with custom buttons.

## Actions Slot

Access swipe methods via the `actions` slot:

```vue
<FlashCards ref="flashcardsRef" :items="cards">
  <template #default="{ item }">
    <!-- card content -->
  </template>

  <template #actions="{ swipeLeft, swipeRight, swipeTop, swipeBottom, restore, skip }">
    <button @click="swipeLeft">Dislike</button>
    <button @click="swipeRight">Like</button>
    <button @click="restore">Undo</button>
  </template>
</FlashCards>
```

## Restore

Bring back the last swiped card:

```vue
<template #actions="{ restore }">
  <button @click="restore">Undo</button>
</template>
```

Or use the ref:

```vue
<script setup>
import { ref } from 'vue'

const flashcardsRef = ref()

function undo() {
  flashcardsRef.value.restore()
}
</script>

<template>
  <FlashCards ref="flashcardsRef" :items="cards">
    <!-- ... -->
  </FlashCards>
  <button @click="undo">Undo</button>
</template>
```

## Skip

Move to the next card without triggering a swipe event:

```vue
<template #actions="{ skip }">
  <button @click="skip">Skip</button>
</template>
```

## Hint (peek)

`peek()` nudges the active card toward a direction **without** completing the swipe — the same rotation and directional indicators react as they do mid-drag. It's a ref-only method (not part of the `actions` slot), handy for inviting a swipe or building a "confirm before swiping" flow.

```vue
<script setup>
import { ref } from 'vue'

const flashcardsRef = ref()

function hint() {
  // Nudge ~15% to the right, then settle back to center.
  flashcardsRef.value.peek(0.15, 'right')
  setTimeout(() => flashcardsRef.value.peek(0, 'right'), 250)
}
</script>

<template>
  <FlashCards ref="flashcardsRef" :items="cards" />
  <button @click="hint">Hint</button>
</template>
```

`peek(percent, direction)` takes a `0`–`1` fraction of the swipe threshold; `peek(0, direction)` settles back to center. See the [API reference](../api/flashcards.md#peek-percent-direction) for details.

**See:** [Examples - Custom Actions](../examples/custom-actions.md)
