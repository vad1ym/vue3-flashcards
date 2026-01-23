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

**See:** [Examples - Custom Actions](../examples/intermediate/custom-actions.md)
