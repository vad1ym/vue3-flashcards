# Vue 3 Flashcards

<div align="center">

**A Tinder-like flashcards component for Vue 3 with smooth animations and intuitive gestures**

[![NPM Version](https://img.shields.io/npm/v/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/vue3-flashcards)
[![NPM Downloads](https://img.shields.io/npm/dm/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/vue3-flashcards)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://bundlephobia.com/package/vue3-flashcards)
[![Coverage](https://codecov.io/gh/vad1ym/vue3-flashcards/branch/main/graph/badge.svg)](https://codecov.io/gh/vad1ym/vue3-flashcards)
[![License](https://img.shields.io/npm/l/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://github.com/vad1ym/vue3-flashcards/blob/main/LICENSE)

[**📚 Documentation**](https://vad1ym.github.io/vue3-flashcards) • [**🎮 Examples**](https://vad1ym.github.io/vue3-flashcards/examples) • [**🚀 Getting Started**](https://vad1ym.github.io/vue3-flashcards/guide/getting-started) • [**▶️ Interactive Demo**](https://vad1ym.github.io/vue3-flashcards/interactive-demo.html)

</div>

---

## ✨ Features

- **🎯 Tinder-style interactions** - Intuitive swipe gestures with smooth animations
- **🔄 Card flipping** - Two-sided cards with beautiful flip animations
- **⚡ Zero dependencies** - Lightweight and performant, built purely with Vue 3 and CSS
- **🎨 Smooth animations** - Hardware-accelerated CSS transitions for 60fps performance
- **🔧 Highly customizable** - Extensive API with props, slots, events, and custom transforms
- **📱 Touch & Mouse support** - Works seamlessly on desktop and mobile devices
- **♾️ Loop mode** - Loop through cards endlessly for continuous swiping
- **🎯 Stack visualization** - Show multiple cards stacked with customizable depth and direction
- **⚙️ Virtual rendering** - Efficient rendering for large datasets with render limit
- **🔄 Restore functionality** - Undo swipes and bring cards back to the stack

## 📦 Installation

```bash
# npm
npm install vue3-flashcards

# yarn
yarn add vue3-flashcards

# pnpm
pnpm add vue3-flashcards
```

## 🚀 Quick Start

### Basic Usage

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([
  { id: 1, title: 'First Card' },
  { id: 2, title: 'Second Card' },
  { id: 3, title: 'Third Card' },
])
</script>

<template>
  <FlashCards
    :items="cards"
    #="{ item }"
  >
    <div class="card">
      <h2>{{ item.title }}</h2>
    </div>
  </FlashCards>
</template>
```

### Vue Plugin (Global Configuration)

Install the plugin to register components globally and set default configuration:

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
    <template #front>
      Front
    </template>
    <template #back>
      Back
    </template>
  </FlipCard>
</template>
```

### Nuxt Module

For Nuxt applications, use the dedicated module:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue3-flashcards/nuxt'],

  // Global configuration
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
    <template #front>
      Front
    </template>
    <template #back>
      Back
    </template>
  </FlipCard>
</template>
```

**Features:**
- ✅ **SSR Compatible** - Works perfectly with server-side rendering
- ✅ **Auto-import** - Components available without imports
- ✅ **Global Config** - Set defaults for all components
- ✅ **TypeScript** - Full IntelliSense in `nuxt.config.ts`

---

## 📖 API Reference

For complete documentation, visit **[documentation](https://vad1ym.github.io/vue3-flashcards)**

### FlashCards Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | **required** | Array of items to display as cards |
| `itemKey` | `string \| number` | `id` | Property to track items by. When provided, items will be tracked by this property instead of their index. Should be unique for each item. This is recommended to use when you modify items array in runtime. |
| `maxRotation` | `number` | `20` | Maximum rotation angle in degrees |
| `swipeThreshold` | `number` | `150` | Swipe swipeThreshold in pixels |
| `dragThreshold` | `number` | `5` | Minimum drag distance to start swiping |
| `swipeDirection` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction of swiping: horizontal (left/right) or vertical (up/down). Affects swipe detection, default transform, and exit animations |
| `maxDragY` | `number \| null` | `null` | Maximum Y dragging distance in pixels (null = unlimited) |
| `maxDragX` | `number \| null` | `null` | Maximum X dragging distance in pixels (null = unlimited) |
| `disableDrag` | `boolean` | `false` | Completely disable dragging functionality. Manual methods and slot actions still work |
| `loop` | `boolean` | `false` | Enable loop swiping mode (cards loop endlessly) |
| `renderLimit` | `number` | `3` | Cards to render. Can't be lower than 1. |
| `stack` | `number` | `0` | Number of cards to show stacked behind the active card. When stack is greater than renderLimit, renderLimit is automatically increased to stack + 2. |
| `stackOffset` | `number` | `20` | Offset in pixels between stacked cards. |
| `stackScale` | `number` | `0.05` | Scale reduction factor for stacked cards. Each card behind is scaled down by this amount × depth. |
| `stackDirection` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Direction where stacked cards appear relative to the active card. |
| `waitAnimationEnd` | `boolean` | `false` | Wait for animation to end before performing next action |
| `transformStyle` | `(position: DragPosition) => string \| null` | `null` | Custom transform function for card movement during drag |

#### Transform Style Function

The `transformStyle` prop allows you to customize how cards transform during drag interactions. It receives a `DragPosition` object with `x`, `y`, and `delta` properties.

**Default behavior:**
```javascript
function defaultTransform(position) {
  return `transform: rotate(${position.delta * maxRotation}deg)`
}
```

**Custom examples:**
```javascript
// Scale effect
function scaleTransform(position) {
  return `transform: rotate(${position.delta * 15}deg) scale(${1 - Math.abs(position.delta) * 0.1})`
}

// Blur effect
function blurTransform(position) {
  return `transform: rotate(${position.delta * 20}deg); filter: blur(${Math.abs(position.delta) * 3}px)`
}
```

### Key Slots

| Slot Name | Props | Description |
|-----------|-------|-------------|
| default | `{ item: T }` | Main content of the card (front side) |
| actions | `{ restore: () => void, reject: () => void, approve: () => void, isEnd: boolean, canRestore: boolean }` | Custom actions UI. `restore` returns to previous card, `reject`/`approve` trigger swipe animations, `isEnd` whether all cards have been swiped, `canRestore` whether there is a previous card to restore to |
| approve | `{ item: T }` | Content shown when swiping right (approval indicator) |
| reject | `{ item: T }` | Content shown when swiping left (rejection indicator) |
| empty | - | Content shown when all cards have been swiped |

## Events

| Event Name | Payload | Description |
|------------|---------|-------------|
| approve | `item: T` | Emitted when a card is approved (swiped right or approved via actions) |
| reject | `item: T` | Emitted when a card is rejected (swiped left or rejected via actions) |
| restore | `item: T` | Emitted when a card is restored (returned to the stack via restore action) |

## Exposed
| Method/Property | Type | Description |
|----------------|------|-------------|
| restore | `() => void` | Returns to the previous card if available |
| approve | `() => void` | Triggers approval animation on current card |
| reject | `() => void` | Triggers rejection animation on current card |
| reset | `(options?) => void` | Resets all cards to initial state. Options: `{ animated?: boolean, delay?: number }` |
| canRestore | `boolean` | Whether there is a previous card to restore to |
| isEnd | `boolean` | Whether all cards have been swiped |

## FlipCard Component

The `FlipCard` component provides card flipping functionality and can be used independently or within FlashCards.

### Props

| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| disabled | `boolean` | No | `false` | Disable card flipping functionality |
| waitAnimationEnd | `boolean` | No | `true` | Wait for animation to end before allowing another flip |
| flipAxis | `'x' \| 'y'` | No | `'y'` | Axis of rotation for the flip animation (x = horizontal, y = vertical) |

### Slots

| Slot Name | Props | Description |
|-----------|-------|-------------|
| front | `{ flip: () => void }` | Content shown on the front of the card. Receives `flip` method for programmatic flipping |
| back | `{ flip: () => void }` | Content shown on the back of the card (optional). Receives `flip` method for programmatic flipping |

### Events

| Event Name | Payload | Description |
|------------|---------|-------------|
| flip | `isFlipped: boolean` | Emitted when the card is flipped. `true` when showing back side, `false` when showing front side |

### Exposed Methods

| Method | Type | Description |
|--------|------|-------------|
| flip | `() => void` | Programmatically flip the card. Respects `disabled` and `waitAnimationEnd` props |

### FlipCard Usage Example

```vue
<script setup>
import { FlipCard } from 'vue3-flashcards'
</script>

<template>
  <FlipCard>
    <template #front>
      <div class="card-front">
        Front Content
      </div>
    </template>
    <template #back>
      <div class="card-back">
        Back Content
      </div>
    </template>
  </FlipCard>
</template>
```
