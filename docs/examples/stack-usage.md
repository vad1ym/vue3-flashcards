---
outline: deep
---

<script setup>
import StackUsage from '../../example/stack-usage/index.vue'
</script>

# Stack Usage

<Badge>Advanced</Badge>

Multiple stacked cards with adjustable size and directional positioning.

## Demo

<ClientOnly>
  <StackUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/stack-usage/index.vue [index.vue]
<<< ../../example/stack-usage/StackCard.vue [StackCard.vue]
:::

## Key Concepts

- **stack**: Number of visible stacked cards (1-10)
- **stackDirection**: Stack positioning ('top', 'bottom', 'left', 'right')
- **stackOffset**: Pixel offset between stacked cards
- **stackScale**: Scale factor for stacked cards (0-1)

## Related

- [Stack Configuration](../../advanced/stack-configuration.md)
