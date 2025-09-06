# Configuration

Learn how to customize Vue3 Flashcards to fit your specific needs.

## FlashCards Component

The main `FlashCards` component accepts several props to control its behavior:

### Core Props

#### `items` <Badge type="danger" text="required" />

- **Type:** `T[]`
- **Description:** Array of items to display as cards. Each item will be passed to the slots.

```vue
<FlashCards :items="myCards" />
```

#### `maxRotation`

- **Type:** `number`
- **Default:** `20`
- **Description:** Maximum rotation angle in degrees when swiping.

```vue
<FlashCards :items="cards" :max-rotation="30" />
```

#### `threshold`

- **Type:** `number`
- **Default:** `150`
- **Description:** Distance in pixels required to trigger swipe actions.

```vue
<FlashCards :items="cards" :threshold="200" />
```

#### `dragThreshold`

- **Type:** `number`
- **Default:** `5`
- **Description:** Minimum drag distance to start swiping. Prevents accidental swipes.

```vue
<FlashCards :items="cards" :drag-threshold="10" />
```

#### `disableVerticalDrag`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Disabling vertical dragging, the card can only move horizontally.

```vue
<FlashCards :items="cards" :disable-vertical-drag="true"  />
```

### Performance Props

#### `virtualBuffer`

- **Type:** `number`
- **Default:** `2`
- **Description:** Number of cards to render before/after current card. Useful for large datasets.

```vue
<!-- Renders 5 cards total: current + 2 before + 2 after -->
<FlashCards :items="largeDataset" :virtual-buffer="2" />
```

## FlipCard Component

The `FlipCard` component can be used independently or within FlashCards:

### Props

#### `disabled`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Disable card flipping functionality.

```vue
<FlipCard :disabled="!allowFlipping" />
```

#### `waitAnimationEnd`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Wait for flip animation to complete before allowing another flip.

```vue
<FlipCard :wait-animation-end="false" />
```


