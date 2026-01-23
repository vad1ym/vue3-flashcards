---
outline: deep
---

<script setup>
import TransitionEffectsUsage from '../../example/transition-effects/index.vue'
</script>

# Transitions

<Badge>Advanced</Badge>

Custom CSS animations with different transition styles.

## Demo

<ClientOnly>
  <TransitionEffectsUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/transition-effects/index.vue [index.vue]
<<< ../../example/transition-effects/TransitionCard.vue [TransitionCard.vue]
:::

## Key Concepts

- **Transition classes**: Apply CSS animations to swiped cards
- **Custom keyframes**: Define your own animations
- **Per-direction styles**: Different animations for left/right/top/bottom
- Override default swipe-out animations

## Common Patterns

```css
/* Fast rotation */
.fast-rotate { animation: fastSpin 0.3s ease-out; }

/* Elastic bounce */
.elastic { animation: elasticBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }

/* 3D flip */
.flip-3d { animation: flip3D 0.6s ease-in-out; }
```

## Related

- [Transition Effects](../advanced/transition-effects.md)
