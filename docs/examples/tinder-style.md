---
outline: deep
---

<script setup>
import TinderUsage from '../../example/tinder-usage/index.vue'
</script>

# Tinder Style

<Badge type="info">Intermediate</Badge>

Image-based cards with visual swipe indicators and multi-directional actions.

## Demo

<ClientOnly>
  <TinderUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/tinder-usage/index.vue [index.vue]
<<< ../../example/tinder-usage/TinderCard.vue [TinderCard.vue]
<<< ../../example/tinder-usage/TinderActions.vue [TinderActions.vue]
:::

## Key Concepts

- **Multi-directional swipe**: `['left', 'right', 'top']`
- **Directional slots**: `#left`, `#right`, `#top` with delta for opacity
- **Image cards**: Profile-style layout with photos
- **Actions slot**: Manual LIKE/NOPE/SUPER LIKE buttons

## Related

- [Swipe Directions](../essentials/swipe-directions.md)
- [Actions](../essentials/actions.md)
