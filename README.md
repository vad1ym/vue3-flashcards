# Vue 3 Flashcards

<div align="center">

**A Tinder-like flashcards component for Vue 3 with smooth animations and intuitive gestures**

> ⚠️ **Development Notice**: This package is currently in development. The API may change between minor versions until v1.0.0 is released.

[![NPM Version](https://img.shields.io/npm/v/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/vue3-flashcards)
[![NPM Downloads](https://img.shields.io/npm/dm/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/vue3-flashcards)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://bundlephobia.com/package/vue3-flashcards)
[![Coverage](https://codecov.io/gh/vad1ym/vue3-flashcards/branch/main/graph/badge.svg)](https://codecov.io/gh/vad1ym/vue3-flashcards)
[![Maintainability](https://qlty.sh/gh/vad1ym/projects/vue3-flashcards/maintainability.svg)](https://qlty.sh/gh/vad1ym/projects/vue3-flashcards)
[![License](https://img.shields.io/npm/l/vue3-flashcards?style=flat&colorA=18181B&colorB=28CF8D)](https://github.com/vad1ym/vue3-flashcards/blob/main/LICENSE)

[**📚 Documentation**](https://vad1ym.github.io/vue3-flashcards) • [**🎮 Examples**](https://vad1ym.github.io/vue3-flashcards/examples) • [**🚀 Getting Started**](https://vad1ym.github.io/vue3-flashcards/guide/getting-started)

</div>

---

## ✨ Features

- **🎯 Tinder-style interactions** - Intuitive swipe gestures with smooth animations
- **🔄 Card flipping** - Two-sided cards with beautiful flip animations
- **⚡ Zero dependencies** - Lightweight and performant, built purely with Vue 3 and CSS

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

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([
  { id: 1, title: 'First Card' },
  { id: 2, title: 'Second Card' },
  { id: 3, title: 'Third Card' },
])

function handleApprove(item) {
  console.log('Liked:', item.title)
}

function handleReject(item) {
  console.log('Passed:', item.title)
}
</script>

<template>
  <div class="flashcards-container">
    <FlashCards
      :items="cards"
      @approve="handleApprove"
      @reject="handleReject"
    >
      <template #default="{ item }">
        <div class="card">
          <h2>{{ item.title }}</h2>
        </div>
      </template>
    </FlashCards>
  </div>
</template>
```

---

## 📖 API Reference

For complete documentation, visit **[documentation](https://vad1ym.github.io/vue3-flashcards)**

### FlashCards Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | **required** | Array of items to display as cards |
| `maxRotation` | `number` | `20` | Maximum rotation angle in degrees |
| `threshold` | `number` | `150` | Swipe threshold in pixels |
| `dragThreshold` | `number` | `5` | Minimum drag distance to start swiping |
| `maxDraggingY` | `number \| null` | `null` | Maximum Y dragging distance in pixels (null = unlimited) |
| `maxDraggingX` | `number \| null` | `null` | Maximum X dragging distance in pixels (null = unlimited) |
| `infinite` | `boolean` | `false` | Enable infinite swiping mode (cards loop endlessly) |
| `virtualBuffer` | `number` | `3` | Cards to render for virtual scrolling. Can't be lower than 1. |
| `stack` | `number` | `0` | Number of cards to show stacked behind the active card. When stack is greater than virtualBuffer, virtualBuffer is automatically increased to stack + 1. |
| `stackOffset` | `number` | `20` | Offset in pixels between stacked cards. |
| `stackScale` | `number` | `0.05` | Scale reduction factor for stacked cards. Each card behind is scaled down by this amount × depth. |
| `stackDirection` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Direction where stacked cards appear relative to the active card. |
| `transformStyle` | `(position: DragPosition) => string \| null` | `null` | Custom transform function for card movement during drag |
| `transitionName` | `string` | `'card-transition'` | CSS transition name for card exit animations. Use `{name}--approved`/`{name}--rejected` classes for direction-based transitions |

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

## Exposed
| Method/Property | Type | Description |
|----------------|------|-------------|
| restore | `() => void` | Returns to the previous card if available |
| approve | `() => void` | Triggers approval animation on current card |
| reject | `() => void` | Triggers rejection animation on current card |
| canRestore | `boolean` | Whether there is a previous card to restore to |
| isEnd | `boolean` | Whether all cards have been swiped |

## FlipCard Component

The `FlipCard` component provides card flipping functionality and can be used independently or within FlashCards.

### Props

| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| disabled | `boolean` | No | `false` | Disable card flipping functionality |
| waitAnimationEnd | `boolean` | No | `true` | Wait for animation to end before allowing another flip |

### Slots

| Slot Name | Props | Description |
|-----------|-------|-------------|
| front | - | Content shown on the front of the card |
| back | - | Content shown on the back of the card (optional) |

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
