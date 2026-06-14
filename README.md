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

- **🎯 Tinder-style swiping** — intuitive drag gestures with smooth animations
- **🔄 Card flipping** — two-sided cards with a flip animation
- **⚡ Zero dependencies** — built purely with Vue 3 and CSS
- **📱 Touch & mouse** — works on desktop and mobile
- **🎨 Bring your own styles** — the library ships no CSS for card content; you style it however you like
- **🔧 Customizable** — props, slots, events, custom transforms and animations
- **♾️ Loop mode**, **🃏 stacked cards**, **↩️ restore (undo)**, and **⚙️ virtual rendering** for large decks

## 📦 Installation

```bash
npm install vue3-flashcards
# or: yarn add vue3-flashcards · pnpm add vue3-flashcards
```

## 🚀 Quick Start

A minimal swipeable deck. The library handles the gestures and animations — you
provide the card content and its styling (plain CSS here):

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([
  { id: 1, title: 'First Card' },
  { id: 2, title: 'Second Card' },
  { id: 3, title: 'Third Card' },
])

function onSwipeRight(item) {
  console.log('liked', item)
}
function onSwipeLeft(item) {
  console.log('passed', item)
}
</script>

<template>
  <FlashCards
    :items="cards"
    @swipe-right="onSwipeRight"
    @swipe-left="onSwipeLeft"
  >
    <template #default="{ item }">
      <div class="card">
        <h2>{{ item.title }}</h2>
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

That's the whole basic usage. Everything below is optional.

> [!NOTE]
> **Styling is up to you.** The library provides the swipe / flip / stack
> mechanics but no visual styles for your card content. The examples use plain
> CSS; you can use any approach (CSS Modules, UnoCSS, Tailwind, a UI kit, etc.).

## 📖 Learn more

The full documentation has guides, runnable examples, and the complete API:

- **[Getting Started](https://vad1ym.github.io/vue3-flashcards/guide/getting-started)** — install and build your first deck
- **[Essentials](https://vad1ym.github.io/vue3-flashcards/essentials/)** — swipe directions, card content, events, actions, flip cards
- **[Advanced](https://vad1ym.github.io/vue3-flashcards/advanced/)** — stacks, loop mode, drag limits, custom transforms & transitions, virtual rendering
- **[Examples](https://vad1ym.github.io/vue3-flashcards/examples/)** — Tinder-style, flip cards, custom actions, and more
- **[API Reference](https://vad1ym.github.io/vue3-flashcards/api/flashcards)** — every prop, slot, event, and method
- **[Migrating to v2](https://vad1ym.github.io/vue3-flashcards/guide/migrating-to-v2)** — upgrading from v1 / v0.x

Using Nuxt or want global defaults? See [Installation](https://vad1ym.github.io/vue3-flashcards/guide/installation) for the Vue plugin and Nuxt module.

## License

[MIT](./LICENSE) © vad1ym
