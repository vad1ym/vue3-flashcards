# Transition Effects

Custom CSS animations for swiped cards.

## Transition Classes

Apply custom animations via CSS:

```vue
<template>
  <FlashCards
    :items="cards"
    transition-class="my-transition"
  >
    <template #default="{ item, isDragging }">
      <div :class="['card', isDragging && 'my-transition']">
        <!-- ... -->
      </div>
    </template>
  </FlashCards>
</template>

<style>
.my-transition.swiping-left {
  animation: slideOutLeft 0.3s ease-out;
}

@keyframes slideOutLeft {
  to {
    transform: translateX(-100%) rotate(-30deg);
    opacity: 0;
  }
}
</style>
```

## Directional Classes

```css
/* Left swipe */
.card.swiping-left { animation: flyLeft 0.3s; }

/* Right swipe */
.card.swiping-right { animation: flyRight 0.3s; }

/* Top swipe */
.card.swiping-top { animation: flyUp 0.3s; }

/* Bottom swipe */
.card.swiping-bottom { animation: flyDown 0.3s; }
```

## Common Patterns

### Fast Rotation

```css
@keyframes fastSpin {
  to { transform: translateX(-200%) rotate(-720deg); }
}
```

### Elastic Bounce

```css
.elastic-swipe {
  animation: elasticOut 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 3D Flip

```css
@keyframes flip3D {
  to {
    transform: translateX(100%) rotateY(180deg);
  }
}
```

**See:** [Examples - Transitions](../examples/advanced/transitions.md)
