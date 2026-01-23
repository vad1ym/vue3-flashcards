---
outline: deep
---

<script setup>
import VirtualUsage from '../../example/virtual-usage/index.vue'
</script>

# Virtual Rendering

<Badge>Advanced</Badge>

Efficiently handle large datasets with virtual DOM rendering.

## Demo

<ClientOnly>
  <VirtualUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/virtual-usage/index.vue [index.vue]
<<< ../../example/virtual-usage/VirtualCard.vue [VirtualCard.vue]
:::

## Key Concepts

- **renderLimit**: Maximum number of cards rendered in DOM
- Only renders visible + upcoming cards
- Dramatically improves performance with 1000+ items
- Maintains smooth animations regardless of dataset size

## Performance

| Cards | Without renderLimit | With renderLimit=5 |
|-------|---------------------|-------------------|
| 100   | ~100 DOM nodes      | ~5 DOM nodes      |
| 1,000 | ~1,000 DOM nodes    | ~5 DOM nodes      |
| 10,000| ~10,000 DOM nodes   | ~5 DOM nodes      |

## Related

- [Virtual Rendering](../advanced/virtual-rendering.md)
