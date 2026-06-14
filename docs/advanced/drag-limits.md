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

Add a rubber-band "resistance" effect with the `resistance` prop. Pass an object
to enable it (or `{}` for defaults); `null` keeps it off.

```vue
<FlashCards
  :max-drag-x="150"
  :max-drag-y="0"
  :resistance="{ threshold: 100, strength: 0.5 }"
>
  <!-- Drags freely up to `threshold` px, then resists -->
</FlashCards>
```

| Field | Type | Default | What it does |
|---|---|---|---|
| `threshold` | `number` (px) | `150` | How far the card moves freely before resistance kicks in |
| `strength` | `number` (0–1) | `0.3` | How hard it resists past the threshold (1 = strongest) |

**See:** [Examples - Drag Limits](../examples/drag-limits.md)
