# FlashCards API

The main component for creating swipeable card interfaces.

## Props

### `items` <Badge type="danger" text="required" />

- **Type:** `T[]`
- **Description:** Array of items to display as cards. Each item will be passed to the default and back slots.

### `itemKey`

- **Type:** `keyof Item | 'id'`
- **Default:** `id`
- **Description:** Property to track items by. When provided, items will be tracked by this property instead of their index. Should be unique for each item. This is recommended to use when you modify items array in runtime.

### `maxRotation`

- **Type:** `number`
- **Default:** `20`
- **Description:** Maximum rotation angle in degrees when swiping cards.

### `swipeThreshold`

- **Type:** `number`
- **Default:** `150`
- **Description:** Threshold in pixels for swipe actions. Cards must be swiped beyond this distance to trigger approve/reject.

### `dragThreshold`

- **Type:** `number`
- **Default:** `5`
- **Description:** Minimum distance in pixels the card must be dragged to start swiping. Helps prevent false positives from small movements like clicks.

### `swipeDirection`

- **Type:** `'horizontal' | 'vertical' | ('left' | 'right' | 'top' | 'bottom')[]`
- **Default:** `'horizontal'`
- **Description:** Direction of swiping interactions. Supports preset modes (`'horizontal'` for left/right, `'vertical'` for up/down) or custom array of specific directions for multi-directional swipe (e.g., `['left', 'right', 'top']` for Tinder-like UX). This affects:
  - Primary axis for swipe detection and completion
  - Default transform style during drag (rotating for horizontal, scaling for vertical)
  - Exit animations (horizontal: slide left/right with rotation, vertical: slide up/down)

**Examples:**
```vue
<!-- Horizontal swiping (default) - with rotation and horizontal animations -->
<FlashCards :items="cards" swipe-direction="horizontal" />

<!-- Vertical swiping - no rotation, vertical animations -->
<FlashCards :items="cards" swipe-direction="vertical" />

<!-- Custom multi-directional - e.g., Tinder-like with left, right, and up -->
<FlashCards :items="cards" :swipe-direction="['left', 'right', 'top']" />

<!-- All 4 directions -->
<FlashCards :items="cards" :swipe-direction="['left', 'right', 'top', 'bottom']" />
```

::: tip Backward Compatibility
The old `approve`/`reject` events and slots remain fully functional. When using preset modes (`'horizontal'` or `'vertical'`), the old API continues to work. However, for new projects or when using array mode, the directional API is recommended.
:::

### `maxDragY`

- **Type:** `number | null`
- **Default:** `null`
- **Description:** Maximum Y dragging distance in pixels. When set, limits vertical card movement. Set to `null` for unlimited vertical dragging.

### `maxDragX`

- **Type:** `number | null`
- **Default:** `null`
- **Description:** Maximum X dragging distance in pixels. When set, limits horizontal card movement. Set to `null` for unlimited horizontal dragging.

### `disableDrag`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Completely disable dragging functionality. When disabled, cards cannot be swiped with touch or mouse gestures. Manual methods (`approve()`, `reject()`, `restore()`) and slot actions still work normally.

### `resistanceEffect`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable resistance effect when dragging beyond the resistance threshold. When enabled, cards become increasingly difficult to drag once they pass the `resistanceThreshold` distance, creating a "sticky" or "elastic" feel that provides visual and tactile feedback to users about the swipe progress.

**Example:**
```vue
<FlashCards :items="cards" :resistance-effect="true" />
```

### `resistanceThreshold`

- **Type:** `number`
- **Default:** `150`
- **Description:** Distance threshold in pixels for resistance effect to activate. Once the card is dragged beyond this distance, resistance begins to apply. This works independently of `swipeThreshold` - you can have resistance start before or after the swipe completion threshold.

**Example:**
```vue
<!-- Resistance starts at 100px, swipe completes at 150px -->
<FlashCards
  :items="cards"
  :resistance-effect="true"
  :resistance-threshold="100"
  :swipe-threshold="150"
/>
```

### `resistanceStrength`

- **Type:** `number`
- **Default:** `0.3`
- **Description:** Strength of resistance effect (0-1, where 1 is maximum resistance). Higher values create stronger resistance, making cards harder to drag beyond the threshold. A value of 0 effectively disables resistance, while 1 creates very strong resistance.

**Examples:**
```vue
<!-- Light resistance -->
<FlashCards
  :items="cards"
  :resistance-effect="true"
  :resistance-strength="0.2"
/>

<!-- Strong resistance -->
<FlashCards
  :items="cards"
  :resistance-effect="true"
  :resistance-strength="0.8"
/>
```

**Resistance Effect Behavior:**
The resistance effect creates a smooth, elastic feel when dragging cards beyond the threshold. The formula provides exponential resistance - the further you drag past the threshold, the harder it becomes to continue dragging. This gives users clear feedback about swipe progress while still allowing completion of the action.

### `loop`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable loop swiping mode. When enabled, cards will loop endlessly after reaching the end. Useful for small datasets where you want continuous swiping.

### `renderLimit`

- **Type:** `number`
- **Default:** `3`
- **Description:** Number of cards to render in dom. Used for virtual rendering with large datasets. Can't be lower than 1.

### `stack`

- **Type:** `number`
- **Default:** `0`
- **Description:** Number of cards to show stacked behind the active card. Creates a visual depth effect where multiple cards are visible with scaling and positioning offsets.

::: warning
When stack is greater than renderLimit, renderLimit is automatically increased to stack + 2 to ensure proper rendering. (1 card is currently visible and 1 is used for transition). This means that if you set `stack="5"`, `renderLimit` will be set to `7` and there will be 7 cards rendered in dom.
:::

**Example:**
```vue
<FlashCards :items="cards" :stack="5" />
```

### `stackOffset`

- **Type:** `number`
- **Default:** `20`
- **Description:** Offset in pixels between stacked cards. Controls the visual spacing between cards in the stack.

**Example:**
```vue
<FlashCards :items="cards" :stack="3" :stack-offset="30" />
```

### `stackScale`

- **Type:** `number`
- **Default:** `0.05`
- **Description:** Scale reduction factor for stacked cards. Each stacked card behind the active card is scaled down by this amount multiplied by its depth position. For example, with `stackScale="0.05"`, the first card behind will have scale 0.95, the second will have scale 0.90, etc.

**Example:**
```vue
<FlashCards :items="cards" :stack="3" :stack-scale="0.1" />
```

### `stackDirection`

- **Type:** `'top' | 'bottom' | 'left' | 'right'`
- **Default:** `'bottom'`
- **Description:** Direction where stacked cards appear relative to the active card.

**Example:**
```vue
<FlashCards :items="cards" :stack="3" stack-direction="right" />
```

### `waitAnimationEnd`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Wait for animation to end before performing next action. When enabled, prevents rapid successive swipes and ensures smooth animations by blocking new actions until current animations complete.

**Example:**
```vue
<FlashCards :items="cards" :wait-animation-end="true" />
```

### `transformStyle`

- **Type:** `(position: DragPosition) => string | null`
- **Default:** `null`
- **Description:** Custom function to define how cards transform during drag interactions. The function receives a `DragPosition` object containing:
  - `x`: Horizontal position in pixels
  - `y`: Vertical position in pixels
  - `delta`: Normalized drag progress (-1 to 1, where negative values indicate left swipes and positive values indicate right swipes)

**Default implementation:**
```javascript
`transform: rotate(${position.delta * maxRotation}deg)`
```

**Example with custom scaling:**
```vue
<script setup>
function customTransform(position) {
  const scale = 1 - Math.abs(position.delta) * 0.15
  const rotation = position.delta * 25
  return `transform: rotate(${rotation}deg) scale(${scale})`
}
</script>

<template>
  <FlashCards
    :items="cards"
    :transform-style="customTransform"
  />
</template>
```

**Example with blur effect:**
```vue
<script setup>
function blurTransform(position) {
  const blur = Math.abs(position.delta) * 3
  return `transform: rotate(${position.delta * 20}deg); filter: blur(${blur}px)`
}
</script>
```

## Slots

### `default`

- **Props:** `{ item: T, activeItemKey: number | string }`
- **Description:** Main content of the card (front side).

```vue
<template>
  <FlashCards :items="cards">
    <template #default="{ item, activeItemKey }">
      <div class="card-content">
        {{ item.title }}
      </div>
       <p>
        Active card = {{ activeItemKey }}
      </p>
    </template>
  </FlashCards>
</template>
```

### `actions`

- **Props:** `{ restore: () => void, swipeTop: () => void, swipeLeft: () => void, swipeRight: () => void, swipeBottom: () => void, skip: () => void, reset: (options?) => void, isEnd: boolean, isStart: boolean, canRestore: boolean, approve: () => void, reject: () => void }`
- **Description:** Custom actions UI for controlling card behavior programmatically.

**Available actions:**
- `restore()` - Returns to the previous card if available
- `swipeTop()` - Triggers upward swipe animation on current card
- `swipeLeft()` - Triggers left swipe animation on current card
- `swipeRight()` - Triggers right swipe animation on current card
- `swipeBottom()` - Triggers downward swipe animation on current card
- `skip()` - Triggers skip animation on current card - moves to next card without swipe
- `reset(options?)` - Resets all cards with optional animation settings
- `isEnd` - Boolean indicating if all cards have been swiped
- `isStart` - Boolean indicating if at the first card (no cards to restore)
- `canRestore` - Boolean indicating if there's a previous card to restore
- `approve()` <Badge type="warning" text="deprecated" /> - Use `swipeRight()` or `swipeTop()` instead
- `reject()` <Badge type="warning" text="deprecated" /> - Use `swipeLeft()` or `swipeBottom()` instead

```vue
<template>
  <FlashCards :items="cards">
    <template #actions="{ swipeLeft, swipeRight, swipeTop, skip, restore, reset, isEnd, isStart, canRestore }">
      <div class="action-buttons">
        <button :disabled="isEnd" @click="swipeLeft">
          ❌ Nope
        </button>
        <button :disabled="isEnd" @click="swipeTop">
          ⭐ Super
        </button>
        <button :disabled="isEnd" @click="skip">
          ⏭️ Skip
        </button>
        <button :disabled="!canRestore || isStart" @click="restore">
          ↩️ Restore
        </button>
        <button :disabled="isEnd" @click="swipeRight">
          ❤️ Like
        </button>

        <!-- Reset with different options -->
        <button @click="reset()">
          🔄 Reset Instantly
        </button>
        <button @click="reset({ animated: true })">
          ✨ Reset with Animation
        </button>
        <button @click="reset({ animated: true, delay: 500 })">
          🎬 Slow Reset Animation
        </button>
      </div>
    </template>
  </FlashCards>
</template>
```

### `approve` <Badge type="warning" text="deprecated" />

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping right (approval indicator). Use `right` or `top` slot instead. The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the approval swipeThreshold.

```vue
<template #approve="{ item, delta }">
  <div
    class="approve-indicator"
    :style="{ opacity: delta }"
  >
    ✅ Like
  </div>
</template>
```

### `reject` <Badge type="warning" text="deprecated" />

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping left (rejection indicator). Use `left` or `bottom` slot instead. The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the rejection swipeThreshold.

### `top`

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping up. The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the swipe threshold.

```vue
<template #top="{ item, delta }">
  <div
    class="top-indicator"
    :style="{ opacity: delta }"
  >
    ⭐ Super Like
  </div>
</template>
```

### `left`

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping left. The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the swipe threshold.

```vue
<template #left="{ item, delta }">
  <div
    class="left-indicator"
    :style="{ opacity: delta }"
  >
    ❌ Nope
  </div>
</template>
```

### `right`

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping right. The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the swipe threshold.

```vue
<template #right="{ item, delta }">
  <div
    class="right-indicator"
    :style="{ opacity: delta }"
  >
    ❤️ Like
  </div>
</template>
```

### `bottom`

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping down. The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the swipe threshold.

```vue
<template #bottom="{ item, delta }">
  <div
    class="bottom-indicator"
    :style="{ opacity: delta }"
  >
    ⬇️ Pass
  </div>
</template>
```

### `empty`

- **Description:** Content shown when all cards have been swiped.

```vue
<template #empty>
  <div class="empty-state">
    <h3>No more cards!</h3>
    <p>You've gone through all the cards.</p>
  </div>
</template>
```

## Events

### `swipeTop`

- **Payload:** `item: T`
- **Description:** Emitted when a card is swiped up.

### `swipeLeft`

- **Payload:** `item: T`
- **Description:** Emitted when a card is swiped left.

### `swipeRight`

- **Payload:** `item: T`
- **Description:** Emitted when a card is swiped right.

### `swipeBottom`

- **Payload:** `item: T`
- **Description:** Emitted when a card is swiped down.

### `approve` <Badge type="warning" text="deprecated" />

- **Payload:** `item: T`
- **Description:** Emitted when a card is approved (swiped right or up via preset modes). Use `swipeRight` or `swipeTop` event instead.

### `reject` <Badge type="warning" text="deprecated" />

- **Payload:** `item: T`
- **Description:** Emitted when a card is rejected (swiped left or down via preset modes). Use `swipeLeft` or `swipeBottom` event instead.

### `skip`

- **Payload:** `item: T`
- **Description:** Emitted when a card is skipped (skipped via actions) - moves to next card without approve/reject.

### `restore`

- **Payload:** `item: T`
- **Description:** Emitted when a card is restored (returned to the stack via restore action).

### `loop`

- **Payload:** None
- **Description:** Emitted when a new loop cycle starts in loop mode. This event fires when all cards have been swiped and the component starts over from the beginning. Only triggered when `loop` prop is enabled.

### `dragstart`

- **Payload:** `item: T`
- **Description:** Emitted when user starts dragging a card. Fires immediately when dragging begins, before any movement threshold is reached.

### `dragmove`

- **Payload:** `item: T, type: SwipeAction | null, delta: number`
- **Description:** Emitted during card dragging with real-time movement details. The `type` indicates the swipe direction (`'approve'` for right/up, `'reject'` for left/down, or `null` if within threshold). The `delta` is a normalized value (-1 to 1) representing drag progress relative to swipe threshold.

### `dragend`

- **Payload:** `item: T`
- **Description:** Emitted when user stops dragging a card, regardless of whether the swipe completed or was cancelled.

**Usage example with all events:**

```vue
<script setup>
function handleSwipeLeft(item) {
  console.log('Swiped left:', item)
  // Add to rejected list, save to database, etc.
}

function handleSwipeRight(item) {
  console.log('Swiped right:', item)
  // Add to approved list, save to database, etc.
}

function handleSwipeTop(item) {
  console.log('Swiped up:', item)
  // Special handling for upward swipes
}

function handleSwipeBottom(item) {
  console.log('Swiped down:', item)
  // Special handling for downward swipes
}

function handleSkip(item) {
  console.log('Skipped:', item)
  // Add to skipped list, analytics, etc.
}

function handleRestore(item) {
  console.log('Restored:', item)
  // Remove from approved/rejected lists, etc.
}

function handleLoop() {
  console.log('New loop cycle started!')
  // Analytics, reset counters, etc.
}

function handleDragStart(item) {
  console.log('Started dragging:', item)
  // Show drag hints, haptic feedback, etc.
}

function handleDragMove(item, type, delta) {
  console.log('Dragging:', item, 'Direction:', type, 'Progress:', delta)
  // Update UI indicators, play sounds, etc.
}

function handleDragEnd(item) {
  console.log('Stopped dragging:', item)
  // Hide drag hints, etc.
}
</script>

<template>
  <FlashCards
    :items="cards"
    :swipe-direction="['left', 'right', 'top']"
    :loop="true"
    @swipe-left="handleSwipeLeft"
    @swipe-right="handleSwipeRight"
    @swipe-top="handleSwipeTop"
    @swipe-bottom="handleSwipeBottom"
    @skip="handleSkip"
    @restore="handleRestore"
    @loop="handleLoop"
    @dragstart="handleDragStart"
    @dragmove="handleDragMove"
    @dragend="handleDragEnd"
  >
    <!-- slots -->
  </FlashCards>
</template>
```

## Exposed Methods & Properties

Access these methods and properties using a template ref:

```vue
<script setup>
const flashcardsRef = ref()

function programmaticSwipeLeft() {
  flashcardsRef.value.swipeLeft()
}

function programmaticSwipeRight() {
  flashcardsRef.value.swipeRight()
}

function programmaticSwipeTop() {
  flashcardsRef.value.swipeTop()
}

function programmaticSkip() {
  flashcardsRef.value.skip()
}

function animatedReset() {
  flashcardsRef.value.reset({ animated: true, delay: 300 })
}
</script>

<template>
  <FlashCards ref="flashcardsRef" :items="cards" />
  <button @click="programmaticSwipeLeft">
    ❌ Nope
  </button>
  <button @click="programmaticSwipeRight">
    ❤️ Like
  </button>
  <button @click="programmaticSwipeTop">
    ⭐ Super
  </button>
  <button @click="programmaticSkip">
    Skip
  </button>
  <button @click="animatedReset">
    Animated Reset
  </button>
</template>
```

### `restore()`

- **Type:** `() => void`
- **Description:** Returns to the previous card if available.

### `swipeTop()`

- **Type:** `() => void`
- **Description:** Triggers upward swipe animation on the current card.

### `swipeLeft()`

- **Type:** `() => void`
- **Description:** Triggers left swipe animation on the current card.

### `swipeRight()`

- **Type:** `() => void`
- **Description:** Triggers right swipe animation on the current card.

### `swipeBottom()`

- **Type:** `() => void`
- **Description:** Triggers downward swipe animation on the current card.

### `approve()` <Badge type="warning" text="deprecated" />

- **Type:** `() => void`
- **Description:** Triggers approval animation on the current card (works only with preset modes). Use `swipeRight()` or `swipeTop()` instead.

### `reject()` <Badge type="warning" text="deprecated" />

- **Type:** `() => void`
- **Description:** Triggers rejection animation on the current card (works only with preset modes). Use `swipeLeft()` or `swipeBottom()` instead.

### `skip()`

- **Type:** `() => void`
- **Description:** Triggers skip animation on the current card - moves to next card without approve/reject.

### `reset(options?)`

- **Type:** `(options?: ResetOptions) => void`
- **Description:** Resets all cards to their initial state. Clears the swipe history and removes all animating cards, effectively returning the component to its starting state.

**ResetOptions:**
```typescript
interface ResetOptions {
  animated?: boolean // If true, restores cards one by one with animations (default: false)
  delay?: number // Delay between animations in ms when animated=true (default: 200)
}
```

**Examples:**
```javascript
// Instant reset (default)
flashcardsRef.value.reset()

// Animated reset with default delay (200ms)
flashcardsRef.value.reset({ animated: true })

// Animated reset with custom delay
flashcardsRef.value.reset({ animated: true, delay: 500 })
```

### `canRestore`

- **Type:** `boolean`
- **Description:** Whether there is a previous card to restore to.

### `isEnd`

- **Type:** `boolean`
- **Description:** Whether all cards have been swiped.

## TypeScript Support

The FlashCards component is fully typed and accepts generic type parameters:

```typescript
interface Card {
  id: number
  title: string
  description: string
  image?: string
}

interface ResetOptions {
  animated?: boolean // Show restore animations (default: false)
  delay?: number // Delay between animations in ms (default: 200)
}

const cards = ref<Card[]>([
  { id: 1, title: 'Card 1', description: 'First card' }
])
```

```vue
<template>
  <FlashCards :items="cards">
    <template #default="{ item }">
      <!-- item is fully typed as Card -->
      <div>{{ item.title }}</div>
    </template>
  </FlashCards>
</template>
```
