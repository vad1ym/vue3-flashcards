# Flip Cards

Create two-sided cards with flip animations.

## FlipCard Component

Use `FlipCard` for independent flip functionality:

```vue
<script setup>
import { FlipCard } from 'vue3-flashcards'
import { ref } from 'vue'

const flipCardRef = ref()

function flip() {
  flipCardRef.value.flip()
}
</script>

<template>
  <FlipCard ref="flipCardRef">
    <template #front>
      <div>Front content</div>
    </template>
    <template #back>
      <div>Back content</div>
    </template>
  </FlipCard>

  <button @click="flip">Flip</button>
</template>
```

## Flip Axis

Control flip direction:

```vue
<FlipCard flip-axis="x">
  <!-- horizontal flip (default) -->
</FlipCard>

<FlipCard flip-axis="y">
  <!-- vertical flip -->
</FlipCard>
```

## Within FlashCards

Use flip cards inside swipeable cards:

```vue
<FlashCards :items="cards">
  <template #default="{ item }">
    <FlipCard>
      <template #front>
        <div>{{ item.question }}</div>
      </template>
      <template #back>
        <div>{{ item.answer }}</div>
      </template>
    </FlipCard>
  </template>
</FlashCards>
```

**See:** [Examples - Flip Cards](../examples/flip-cards.md)
