# Getting Started

::: tip Upgrading from v0.x?
See the [Migration Guide](./migration-from-v0) for upgrading from previous versions.
:::

Quick start guide to building your first swipeable card interface.

## Installation

```bash
npm install vue3-flashcards
```

[See all installation options →](./installation.md)

## Quick Start

Here's a minimal example:

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([
  { id: 1, text: 'First Card' },
  { id: 2, text: 'Second Card' },
  { id: 3, text: 'Third Card' },
])

function handleSwipeLeft(item) {
  console.log('Swiped left:', item)
}

function handleSwipeRight(item) {
  console.log('Swiped right:', item)
}
</script>

<template>
  <FlashCards
    :items="cards"
    @swipe-left="handleSwipeLeft"
    @swipe-right="handleSwipeRight"
  >
    <template #default="{ item }">
      <div class="card">
        <h3>{{ item.text }}</h3>
      </div>
    </template>
  </FlashCards>
</template>
```

## Next Steps

- **[Installation](./installation.md)** - npm, yarn, pnpm, Vue plugin, Nuxt module
- **[Basic Concepts](./basic-concepts.md)** - Items array, card lifecycle, events
- **[Essentials](../essentials/)** - Core features: swipe directions, events, actions
- **[Examples](../examples/)** - Interactive demos
