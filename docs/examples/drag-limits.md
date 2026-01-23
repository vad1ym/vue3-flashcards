---
outline: deep
---

<script setup>
import LimitUsage from '../../example/limit-usage/index.vue'
</script>

# Drag Limits

<Badge type="info">Intermediate</Badge>

Constrain dragging in specific directions with maxDragX and maxDragY.

## Demo

<ClientOnly>
  <LimitUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/limit-usage/index.vue [index.vue]
<<< ../../example/limit-usage/LimitCard.vue [LimitCard.vue]
:::

## Key Concepts

- **maxDragX**: Limit horizontal dragging (0 = no horizontal drag)
- **maxDragY**: Limit vertical dragging (0 = no vertical drag)
- Combine with swipeDirection to control allowed swipes
- Useful for: vertical-only cards with controlled horizontal movement

## Related

- [Drag Limits](../../advanced/drag-limits.md)
