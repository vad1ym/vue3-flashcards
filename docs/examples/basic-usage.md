---
outline: deep
---

<script setup>
import BasicUsage from '../../example/basic-usage/index.vue'
</script>

# Basic Usage

<Badge type="tip">Beginner</Badge>

Simple swipeable cards with minimal setup.

## Demo

<ClientOnly>
  <BasicUsage />
</ClientOnly>

:::details Source
<<< ../../example/basic-usage/index.vue
:::

## Key Concepts

- **items prop**: Array of card objects
- **default slot**: Render card content with `{ item }`
- **Events**: `@swipe-left` and `@swipe-right` handle completed swipes

## Related

- [Swipe Directions](../../essentials/swipe-directions.md)
- [Card Content](../../essentials/card-content.md)
