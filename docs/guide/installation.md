# Installation

Detailed installation options for Vue3 Flashcards.

## Package Managers

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

## Vue Plugin

For global component registration and default configuration:

```typescript
// main.ts
import { createApp } from 'vue'
import { FlashCardsPlugin } from 'vue3-flashcards'
import App from './App.vue'

const app = createApp(App)

app.use(FlashCardsPlugin, {
  flashCards: {
    stack: 3,
    stackOffset: 25,
    swipeThreshold: 150,
  },
  flipCard: {
    flipAxis: 'x',
  }
})

app.mount('#app')
```

## Nuxt Module

For Nuxt applications with SSR support:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue3-flashcards/nuxt'],
  flashcards: {
    stack: 3,
    swipeThreshold: 150,
  }
})
```

Components are auto-imported in Nuxt.

## CDN Usage

```html
<script type="module">
  import { FlashCards } from 'https://unpkg.com/vue3-flashcards?module'
</script>
```

## TypeScript

Full TypeScript support is included. No additional setup required.
