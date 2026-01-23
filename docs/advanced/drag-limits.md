# Drag Limits

Constrain dragging in specific directions.

## maxDragX / maxDragY

Limit how far cards can be dragged:

```vue
<FlashCards
  :items="cards"
  :max-drag-x="200"
  :max-drag-y="0"
>
  <!-- Horizontal: max 200px -->
  <!-- Vertical: no drag allowed -->
</FlashCards>
```

## Common Patterns

### Vertical Swipe Only

```vue
<FlashCards
  swipe-direction="vertical"
  :max-drag-x="0"
>
  <!-- Only allow vertical swipes -->
</FlashCards>
```

### Constrained Horizontal

```vue
<FlashCards
  swipe-direction="horizontal"
  :max-drag-x="150"
>
  <!-- Limited horizontal drag -->
</FlashCards>
```

### Diagonal Constraint

```vue
<FlashCards
  :max-drag-x="100"
  :max-drag-y="100"
>
  <!-- Limited diagonal movement -->
</FlashCards>
```

## With Resistance

Combine with `resistanceEffect` for physical feedback:

```vue
<FlashCards
  :max-drag-x="150"
  :max-drag-y="0"
  :resistance-effect="true"
  resistance-threshold="0.8"
>
  <!-- Resists at limit -->
</FlashCards>
```

**See:** [Examples - Drag Limits](../examples/drag-limits.md)
