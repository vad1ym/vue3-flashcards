---
outline: deep
---

<script setup>
import DeltaUsage from '../../example/delta-usage/index.vue'
</script>

# Delta Indicators

<Badge type="info">Intermediate</Badge>

Custom swipe indicators with dynamic opacity based on drag distance.

## Demo

<ClientOnly>
  <DeltaUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/delta-usage/index.vue [index.vue]
<<< ../../example/delta-usage/LanguageCard.vue [LanguageCard.vue]
<<< ../../example/delta-usage/SwipeOverlay.vue [SwipeOverlay.vue]
:::

## Key Concepts

- **delta prop**: Value from -1 to 1 indicating drag progress
- **Use for**: Progressive opacity, scale, or color changes
- **Calculation**: `opacity = Math.abs(delta)` for fade-in effect
- Creates responsive visual feedback during drag

## Related

- [Swipe Directions](../essentials/swipe-directions.md)
