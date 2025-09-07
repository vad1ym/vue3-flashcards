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

#### `stack`

- **Type:** `number`
- **Default:** `0`
- **Description:** Number of cards to show stacked behind the active card. Creates a visual depth effect where multiple cards are visible with scaling and positioning offsets. When stack is greater than virtualBuffer, virtualBuffer is automatically increased to stack + 1 to ensure proper rendering.

```vue
<!-- Show 3 cards stacked behind the active card -->
<FlashCards :items="cards" :stack="3" />
```

#### `stackOffset`

- **Type:** `number`
- **Default:** `20`
- **Description:** Offset in pixels between stacked cards. Controls the visual spacing between cards in the stack.

```vue
<!-- Increase spacing between stacked cards -->
<FlashCards :items="cards" :stack="3" :stack-offset="30" />
```

#### `stackScale`

- **Type:** `number`
- **Default:** `0.05`
- **Description:** Scale reduction factor for stacked cards. Each stacked card behind the active card is scaled down by this amount multiplied by its depth position. For example, with `stackScale="0.05"`, the first card behind will have scale 0.95, the second will have scale 0.90, etc.

```vue
<!-- More pronounced scaling effect for stacked cards -->
<FlashCards :items="cards" :stack="3" :stack-scale="0.1" />
```

#### `stackDirection`

- **Type:** `'top' | 'bottom' | 'left' | 'right'`
- **Default:** `'bottom'`
- **Description:** Direction where stacked cards appear relative to the active card.

```vue
<!-- Stack cards to the right -->
<FlashCards :items="cards" :stack="3" stack-direction="right" />
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

#### `transitionName`

- **Type:** `string`
- **Default:** `'card-transition'`
- **Description:** Name of the CSS transition used when cards disappear after being swiped. Allows customization of the exit animation. Direction-based transitions can be created using `{transition-name}--approved` and `{transition-name}--rejected` modifier classes.

```vue
<FlashCards :items="cards" transition-name="custom-card-exit" />
```

**Custom transition CSS example:**
```css
.custom-card-exit-enter-active,
.custom-card-exit-leave-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.custom-card-exit-enter-from,
.custom-card-exit-leave-to {
  opacity: 0;
}

/* Direction-based animations using modifier classes */
.custom-card-exit-enter-from.custom-card-exit--rejected,
.custom-card-exit-leave-to.custom-card-exit--rejected {
  transform: translateX(-400px) rotate(-30deg);
}

.custom-card-exit-enter-from.custom-card-exit--approved,
.custom-card-exit-leave-to.custom-card-exit--approved {
  transform: translateX(400px) rotate(30deg);
}
```

### Performance Props

#### `virtualBuffer`

- **Type:** `number`
- **Default:** `3`
- **Description:** Number of cards to render. Useful for large datasets. Can't be lower than 1.

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
