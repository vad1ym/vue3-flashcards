# Stack Configuration

Display multiple cards stacked behind the active card with visual depth.

## Stack Size

Number of visible stacked cards:

```vue
<FlashCards :stack="3" :items="cards">
  <!-- Shows 3 cards stacked -->
</FlashCards>
```

Default: `1` (no stacking) | Range: `1-10`

## Stack Direction

Position stacked cards in a direction:

```vue
<FlashCards stack-direction="bottom" :items="cards">
  <!-- Stack below active card -->
</FlashCards>
```

Options: `'top'` | `'bottom'` | `'left'` | `'right'`

## Stack Offset

Pixel distance between stacked cards:

```vue
<FlashCards :stack-offset="25" :items="cards">
  <!-- 25px between cards -->
</FlashCards>
```

## Stack Scale

Scale factor for each stacked card:

```vue
<FlashCards :stack-scale="0.95" :items="cards">
  <!-- Each card is 95% of previous -->
</FlashCards>
```

Range: `0-1` (1 = no scaling)

## Visual Effect

```
┌─────────────┐
│             │
|   Card 1    | ← active card (100%)
|             |
├─────────────┤
│   Card 2    │ ← stackScale, offset × 1
├─────────────┤
│   Card 3    │ ← stackScale², offset × 2
└─────────────┘
```

**See:** [Examples - Stack Usage](../examples/advanced/stack-usage.md)
