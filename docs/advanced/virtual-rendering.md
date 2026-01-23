# Virtual Rendering

Efficiently handle large datasets by limiting rendered DOM nodes.

## renderLimit

Maximum number of cards rendered in the DOM:

```vue
<FlashCards :items="largeDataset" :render-limit="5">
  <!-- Only 5 cards in DOM at a time -->
</FlashCards>
```

Default: Renders all cards | Recommended: `3-10`

## How It Works

```
Dataset: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                    ↓
renderLimit: 3
                    ↓
DOM: [<Card 3>, <Card 2>, <Card 1>]
```

Only the current card and upcoming cards are rendered. As cards are swiped, new cards are rendered and old ones are removed.

## When to Use

| Dataset Size | Use Virtual? |
|--------------|-------------|
| < 100        | Optional    |
| 100-1,000    | Recommended |
| 1,000+       | Essential   |

## Performance Impact

```vue
<!-- Without virtual rendering -->
<FlashCards :items="Array(10000)">
  <!-- 10,000 DOM nodes -->
</FlashCards>

<!-- With virtual rendering -->
<FlashCards :items="Array(10000)" :render-limit="5">
  <!-- Only 5 DOM nodes -->
</FlashCards>
```

**See:** [Examples - Virtual Rendering](../examples/advanced/virtual-rendering.md)
