---
outline: deep
---

<script setup>
import ScaleUsage from '../../example/scale-usage/index.vue'
</script>

# Scale Transform

<Badge>Advanced</Badge>

Custom transform that scales cards instead of rotating during swipe.

## Demo

<ClientOnly>
  <ScaleUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/scale-usage/index.vue [index.vue]
<<< ../../example/scale-usage/ScaleCard.vue [ScaleCard.vue]
:::

## Key Concepts

- **transformStyle**: Custom transform function
- Override default rotation behavior
- Return transform string for card element
- Example: `return 'scale(0.9)'` instead of rotation

## Related

- [Custom Transforms](../advanced/custom-transforms.md)
