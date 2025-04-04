# Vue 3 Flashcards Documentation

A Tinder-like flashcards component for Vue 3 with dragging and flipping animations. Built with TypeScript and Vue 3 Composition API.

> ⚠️ **Development Notice**: This package is currently in development. The API may change between minor versions until v1.0.0 is released

## Installation

```bash
npm install vue3-flashcards
```

## Usage

### Basic Example

Here's a simple example showing how to create a basic flashcards component:

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([
  { text: 'Front 1' },
  { text: 'Front 2' },
  { text: 'Front 3' },
])
</script>

<template>
  <div class="w-full flex justify-center items-center min-h-screen">
    <div class="max-w-sm w-full">
      <FlashCards :items="cards" #="{ item }">
        <div class="p-5 bg-base-200 border border-base-300 shadow-lg rounded-lg h-40 flex justify-center items-center">
          <div>{{ item.text }}</div>
        </div>
      </FlashCards>
    </div>
  </div>
</template>
```

## Props

| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| items | `T[]` | Yes | - | Array of items to display as cards. Each item will be passed to the default and back slots. |
| flip | `boolean` | No | `false` | Enable card flipping functionality. When enabled, cards can be flipped to reveal content in the `back` slot. |
| maxRotation | `number` | No | `20` | Maximum rotation angle in degrees. |
| threshold | `number` | No | `150` | Threshold in pixels for swipe actions. |
| virtualBuffer | `number` | No | `1` | Number of cards to render before/after the current card. Used for virtual rendering with large datasets. A value of 2 means 5 cards total will be rendered (current + 2 before + 2 after). |

## Slots

| Slot Name | Props | Description |
|-----------|-------|-------------|
| default | `{ item: T }` | Main content of the card (front side) |
| back | `{ item: T }` | Content shown when card is flipped (requires `flip` prop) |
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
