# Events

Handle swipe interactions and user actions.

## Swipe Events

Fired when a card completes a swipe:

```vue
<FlashCards
  :items="cards"
  @swipe-left="handleLeft"
  @swipe-right="handleRight"
  @swipe-top="handleTop"
  @swipe-bottom="handleBottom"
>
  <!-- ... -->
</FlashCards>
```

Each event receives the swiped item:

```typescript
function handleLeft(item: CardType) {
  console.log('Swiped left:', item)
  // Save to database, update UI, etc.
}
```

## Drag Events

Track drag state in real-time:

```vue
<FlashCards
  :items="cards"
  @dragstart="isDragging = true"
  @dragmove="handleDragMove"
  @dragend="isDragging = false"
>
  <!-- ... -->
</FlashCards>
```

```typescript
function handleDragMove(data: { item: CardType; delta: { x: number; y: number } }) {
  // Update UI based on drag position
}
```

## Special Events

```vue
<FlashCards
  :items="cards"
  @restore="handleRestore"
  @skip="handleSkip"
  @loop="handleLoop"
>
  <!-- ... -->
</FlashCards>
```

- `restore` - Card is returned to the stack
- `skip` - Card is skipped (no swipe direction)
- `loop` - In loop mode, fired when cycling back

**See:** [API Reference - Events](../api/flashcards.md#events)
