# Getting Started

Vue3 Flashcards is a powerful and flexible library for creating Tinder-like card interfaces in Vue 3 applications. Built with TypeScript and the Vue 3 Composition API, it provides smooth animations, touch support, and extensive customization options.

## Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install vue3-flashcards
```

```bash [yarn]
yarn add vue3-flashcards
```

```bash [pnpm]
pnpm add vue3-flashcards
```

:::

## Quick Start

Here's a minimal example to get you started:

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([
  { id: 1, text: 'First Card' },
  { id: 2, text: 'Second Card' },
  { id: 3, text: 'Third Card' },
])

function handleApprove(item) {
  console.log('Approved:', item)
}

function handleReject(item) {
  console.log('Rejected:', item)
}
</script>

<template>
  <div class="card-container">
    <FlashCards
      :items="cards"
      @approve="handleApprove"
      @reject="handleReject"
    >
      <template #default="{ item }">
        <div class="card">
          <h3>{{ item.text }}</h3>
        </div>
      </template>
    </FlashCards>
  </div>
</template>
```

## Development Notice

::: warning Development Status
This package is currently in development. The API may change between minor versions until v1.0.0 is released.
:::

## What's Next?

- **[API Reference →](../api/flashcards)** - Complete component documentation
- **[Examples →](../examples)** - Interactive demos and use cases
