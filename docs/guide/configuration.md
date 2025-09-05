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

#### `maxDraggingY`

- **Type:** `number | null`
- **Default:** `null`
- **Description:** Maximum Y dragging distance in pixels. Limits vertical movement.

```vue
<!-- Prevent vertical dragging -->
<FlashCards :items="cards" :max-dragging-y="0" />
```

#### `maxDraggingX`

- **Type:** `number | null`
- **Default:** `null`
- **Description:** Maximum X dragging distance in pixels. Limits horizontal movement.

```vue
<!-- Limit horizontal dragging to 200px -->
<FlashCards :items="cards" :max-dragging-x="200" />
```

#### `infinite`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable infinite swiping mode. When enabled, cards will loop endlessly after reaching the end.

```vue
<!-- Enable infinite swiping -->
<FlashCards :items="cards" :infinite="true" />
```

#### `transformStyle`

- **Type:** `(position: DragPosition) => string | null`
- **Default:** `null`
- **Description:** Custom function to define how cards transform during drag interactions. Receives a `DragPosition` object with `x`, `y`, and `delta` properties.

```vue
<script setup>
import { FlashCards } from 'vue3-flashcards'

const cards = ref([...])

// Custom transform with scaling effect
const customTransform = (position) => {
  const scale = 1 - Math.abs(position.delta) * 0.1
  return `transform: rotate(${position.delta * 15}deg) scale(${scale})`
}
</script>

<template>
  <FlashCards 
    :items="cards" 
    :transform-style="customTransform"
  />
</template>
```

**Default behavior (when `transformStyle` is not provided):**
```javascript
`transform: rotate(${position.delta * maxRotation}deg)`
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


