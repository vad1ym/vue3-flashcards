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

### Basic Usage

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

### Vue Plugin (Global Configuration)

For applications that use FlashCards components throughout, install the plugin to register components globally and set default configuration:

```typescript
// main.ts
import { createApp } from 'vue'
import { FlashCardsPlugin } from 'vue3-flashcards'
import App from './App.vue'

const app = createApp(App)

app.use(FlashCardsPlugin, {
  flashCards: {
    // Global defaults for FlashCards components
    stack: 3,
    stackOffset: 25,
    swipeThreshold: 150,
    loop: true,
  },
  flipCard: {
    // Global defaults for FlipCard components
    flipAxis: 'x',
    waitAnimationEnd: false,
  }
})

app.mount('#app')
```

Now components are globally available without imports:

```vue
<template>
  <!-- No imports needed! -->
  <FlashCards :items="cards">
    <template #default="{ item }">
      <div>{{ item.title }}</div>
    </template>
  </FlashCards>

  <FlipCard>
    <template #front>Front</template>
    <template #back>Back</template>
  </FlipCard>
</template>
```

### Nuxt Module

For Nuxt applications, use the dedicated module for automatic configuration and SSR support:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue3-flashcards/nuxt'],

  // Global configuration (optional)
  flashcards: {
    stack: 3,
    stackOffset: 25,
    swipeThreshold: 150,
    loop: true,
  }
})
```

Components are auto-imported and globally available:

```vue
<template>
  <!-- Auto-imported, no imports needed! -->
  <FlashCards :items="cards">
    <template #default="{ item }">
      <div>{{ item.title }}</div>
    </template>
  </FlashCards>

  <FlipCard>
    <template #front>Front</template>
    <template #back>Back</template>
  </FlipCard>
</template>
```

**Nuxt Module Features:**
- ✅ **SSR Compatible** - Works perfectly with server-side rendering
- ✅ **Auto-import** - Components available without manual imports
- ✅ **Global Config** - Set defaults for all components via `nuxt.config.ts`
- ✅ **TypeScript** - Full IntelliSense support

## Development Notice

::: warning Development Status
This package is currently in development. The API may change between minor versions until v1.0.0 is released.
:::

## What's Next?

- **[API Reference →](../api/flashcards)** - Complete component documentation
- **[Examples →](../examples)** - Interactive demos and use cases
