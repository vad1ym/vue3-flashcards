# Stack Configuration

Display multiple cards stacked behind the active card with visual depth.

## Stack Size

Number of visible stacked cards:

```vue
<FlashCards :stack="3" :items="cards">
  <!-- Shows 3 cards behind the active card -->
</FlashCards>
```

Default: `0` (no stacking). This is the number of cards shown _behind_ the
active one.

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

How much smaller each card behind the active one gets. This is a **reduction
factor per depth**: a card at depth _n_ is scaled by `1 - stackScale × n`.

```vue
<FlashCards :stack-scale="0.05" :items="cards">
  <!-- 1st behind: 95%, 2nd behind: 90%, ... -->
</FlashCards>
```

Default: `0.05`. Use `0` for no scaling (all cards the same size).

## Visual Effect

```
┌─────────────┐
│             │
|   Card 1    | ← active card (100%, offset 0)
|             |
├─────────────┤
│   Card 2    │ ← scale 1 − stackScale×1, offset × 1
├─────────────┤
│   Card 3    │ ← scale 1 − stackScale×2, offset × 2
└─────────────┘
```

**See:** [Examples - Stack Usage](../examples/stack-usage.md)
