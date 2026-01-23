---
outline: deep
---

<script setup>
import CustomActionsUsage from '../../example/custom-actions/index.vue'
</script>

# Custom Actions

<Badge type="info">Intermediate</Badge>

Manual control buttons with skip and restore functionality.

## Demo

<ClientOnly>
  <CustomActionsUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/custom-actions/index.vue [index.vue]
<<< ../../example/custom-actions/LearningCard.vue [LearningCard.vue]
<<< ../../example/custom-actions/ActionButtons.vue [ActionButtons.vue]
:::

## Key Concepts

- **actions slot**: Access `{ swipeLeft, swipeRight, restore, skip }` methods
- **skip()**: Move to next card without swipe event
- **restore()**: Bring back the last swiped card
- Perfect for: quiz apps, learning cards, manual controls

## Related

- [Actions Guide](../essentials/actions.md)
