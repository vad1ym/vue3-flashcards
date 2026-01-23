---
outline: deep
---

<script setup>
import InfiniteUsage from '../../example/infinite-usage/index.vue'
</script>

# Infinite Loop

<Badge>Advanced</Badge>

Endless card swiping with a small dataset that cycles.

## Demo

<ClientOnly>
  <InfiniteUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/infinite-usage/index.vue [index.vue]
<<< ../../example/infinite-usage/InfiniteCard.vue [InfiniteCard.vue]
:::

## Key Concepts

- **loop**: Enable infinite cycling through cards
- **@loop event**: Fires when cycling back to the first card
- Perfect for: small content sets, endless browsing, practice modes

## Related

- [Loop Mode](../../advanced/loop-mode.md)
