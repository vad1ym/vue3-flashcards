# Essentials

Core features you need to build swipeable card interfaces.

## The simplest deck

If you only remember one thing, it's this: pass `items`, then render each card in
the `default` slot. Everything else is optional.

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([
  { id: 1, title: 'First' },
  { id: 2, title: 'Second' },
])
</script>

<template>
  <FlashCards :items="cards">
    <template #default="{ item }">
      <div class="card">
        {{ item.title }}
      </div>
    </template>
  </FlashCards>
</template>

<style scoped>
.card {
  width: 300px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
```

From here, each page below adds one capability.

## Topics

- [Swipe Directions](./swipe-directions.md) - Horizontal, vertical, and multi-directional swiping
- [Card Content](./card-content.md) - Using slots and structuring cards
- [Events](./events.md) - Handling swipe events
- [Actions](./actions.md) - Manual controls and buttons
- [Flip Cards](./flip-cards.md) - Two-sided flip cards
- [Accessibility](./accessibility.md) - Keyboard, ARIA, announcements, reduced motion

## Learning Path

Start with [Swipe Directions](./swipe-directions.md) to understand directional swiping, then explore [Events](./events.md) and [Actions](./actions.md) to handle user interactions.
