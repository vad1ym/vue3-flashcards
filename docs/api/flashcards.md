---
outline: [2, 3]
---

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
- **Description:** Threshold in pixels for swipe actions. Cards must be swiped beyond this distance to trigger a directional swipe.

### `dragThreshold`

- **Type:** `number`
- **Default:** `5`
- **Description:** Minimum distance in pixels the card must be dragged to start swiping. Helps prevent false positives from small movements like clicks.

### `velocity`

- **Type:** `{ threshold?: number } | null`
- **Default:** enabled (with default threshold `0.5`)
- **Description:** Velocity-based ("flick") swipe completion. A fast flick completes the swipe even if the card is released before reaching `swipeThreshold` — matching the feel of native mobile card UIs where a quick toss is enough. The flick must point the same way the card was already moving, so a brief jitter never flings the card the wrong direction. It is **on by default**; pass `null` to require the distance threshold only, or an object to tune the threshold.
  - **`threshold`** (`number`, default `0.5`): minimum pointer speed in px/ms (≈500 px/s) at release to trigger a flick. Lower = easier to flick away; higher = needs a faster gesture.

**Example:**
```vue
<!-- Distance threshold only, no flick completion -->
<FlashCards :items="cards" :velocity="null" />

<!-- Require a faster flick -->
<FlashCards :items="cards" :velocity="{ threshold: 0.8 }" />

<!-- Very easy to flick away -->
<FlashCards :items="cards" :velocity="{ threshold: 0.3 }" />
```

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
- **Description:** Completely disable dragging functionality. When disabled, cards cannot be swiped with touch or mouse gestures. Manual methods (`swipeRight()`, `swipeLeft()`, `restore()`, etc.) and slot actions still work normally.

### `resistance`

- **Type:** `{ threshold?: number, strength?: number } | null`
- **Default:** `null` (disabled)
- **Description:** Rubber-band "resistance" when dragging beyond a threshold. Once the card passes `threshold` it becomes increasingly hard to drag, creating a "sticky" / elastic feel that signals swipe progress. Pass an object to enable it (use `{}` for defaults), or `null` to disable.
  - **`threshold`** (`number`, default `150`): distance in px the card moves freely before resistance starts. Independent of `swipeThreshold`.
  - **`strength`** (`number` 0–1, default `0.3`): how hard it resists past the threshold. `1` is the strongest; near `0` is barely noticeable.

**Examples:**
```vue
<!-- Enable with defaults -->
<FlashCards :items="cards" :resistance="{}" />

<!-- Resistance starts at 100px, swipe completes at 150px -->
<FlashCards
  :items="cards"
  :resistance="{ threshold: 100 }"
  :swipe-threshold="150"
/>

<!-- Light vs strong resistance -->
<FlashCards :items="cards" :resistance="{ strength: 0.2 }" />
<FlashCards :items="cards" :resistance="{ strength: 0.8 }" />
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

### `animation`

- **Type:** `{ keyframes?, duration?, easing? }`
- **Default:** built-in Tinder-style fly-out
- **Description:** Customizes the swipe-out / restore animation (driven by the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)). All three fields are optional — omit the prop to keep the defaults.
  - **`keyframes`** (`(ctx: AnimationContext) => Keyframe | Keyframe[]`): the off-screen end frame the card flies out to, from center. The library starts it from the drag-release point and plays it reversed for restore.
  - **`duration`** (`number`, default `400`): fly-out / restore duration in ms.
  - **`easing`** (`string`, default `cubic-bezier(0.4, 0, 0.2, 1)`): any CSS easing string.

**Example:**
```vue
<script setup>
const animation = {
  duration: 300,
  easing: 'ease-out',
  keyframes: (ctx) => {
    const x = ctx.type === 'left' ? -320 : 320
    return { transform: `translateX(${x}px) rotate(15deg)`, opacity: 0 }
  },
}
</script>

<template>
  <FlashCards :items="cards" :animation="animation" />
</template>
```

See [Transition Effects](../advanced/transition-effects.md) for the full guide.

### `a11y`

- **Type:** `boolean | A11yOptions`
- **Default:** enabled
- **Description:** Accessibility configuration. **On by default** — keyboard navigation, ARIA roles, a live-region announcer, `prefers-reduced-motion` support, and focus management all work out of the box. Pass `false` to disable everything, or an object to tune individual pieces (every field optional):
  - **`enabled`** (`boolean`, default `true`): master switch. `false` removes all roles, the live region, keyboard handling, and focus management.
  - **`keyboard`** (`boolean`, default `true`): arrow keys swipe in enabled directions, Enter / Space triggers the primary swipe, Backspace / `z` restores.
  - **`confirmOnKey`** (`boolean`, default `false`): when `true`, an arrow key first [`peek`](#peek-percent-direction)s the card to its full pre-swipe pose and waits for Enter / Space (or a second matching arrow) to confirm; Escape cancels.
  - **`manageFocus`** (`boolean`, default `true`): move focus to the next active card after a keyboard swipe (only when the deck already holds focus).
  - **`liveMode`** (`'polite' | 'assertive'`, default `'polite'`): `aria-live` politeness of the announcer.
  - **`labels`** (`Partial<A11yLabels>`): override the built-in English labels for localization (`deck`, `card`, `top`, `left`, `right`, `bottom`, `skip`, `restore`, `empty`, `instructions`).
  - **`announce`** (`(event: A11yAnnounceEvent) => string | null`): build the live-region message yourself; return `null` / `''` to stay silent for an event.

**Example — disable everything:**
```vue
<FlashCards :items="cards" :a11y="false" />
```

**Example — localize and tune:**
```vue
<FlashCards
  :items="cards"
  :a11y="{
    confirmOnKey: true,
    liveMode: 'assertive',
    labels: { deck: 'Колода', card: 'Карточка', right: 'вправо', left: 'влево' },
  }"
/>
```

See the [Accessibility guide](../essentials/accessibility.md) for the full walkthrough.

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

- **Props:** `{ restore: () => void, swipeTop: () => void, swipeLeft: () => void, swipeRight: () => void, swipeBottom: () => void, skip: () => void, reset: (options?) => void, isEnd: boolean, isStart: boolean, canRestore: boolean }`
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

### `skip`

- **Payload:** `item: T`
- **Description:** Emitted when a card is skipped (skipped via actions) - moves to next card without swiping in any direction.

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
- **Description:** Emitted during card dragging with real-time movement details. The `type` indicates the swipe direction (`'top'`, `'left'`, `'right'`, `'bottom'`, or `null` if within threshold). The `delta` is a normalized value (-1 to 1) representing drag progress relative to swipe threshold.

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

function hintSwipe() {
  // Nudge the card to hint a swipe, then settle it back.
  flashcardsRef.value.peek(0.15, 'right')
  setTimeout(() => flashcardsRef.value.peek(0, 'right'), 250)
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
  <button @click="hintSwipe">
    Hint
  </button>
  <button @click="animatedReset">
    Animated Reset
  </button>
</template>
```

### `restore()`

- **Type:** `() => void`
- **Description:** Returns to the previous card if available.

### `swipe(direction)`

- **Type:** `(direction: 'top' | 'left' | 'right' | 'bottom') => void`
- **Description:** Declarative swipe — `swipe('left')` is equivalent to `swipeLeft()`. Handy when the direction is dynamic.

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

### `skip()`

- **Type:** `() => void`
- **Description:** Triggers skip animation on the current card - moves to next card without swiping in any direction.

### `peek(percent, direction)`

- **Type:** `(percent: number, direction: 'top' | 'left' | 'right' | 'bottom') => void`
- **Description:** Moves the active card toward `direction` to `percent` (a `0`–`1` fraction of [`swipeThreshold`](#swipethreshold)) **without** completing the swipe — the same rotation/scale ([`transformStyle`](#transformstyle)) and directional indicators react exactly as they do mid-drag. Useful for hints (nudge the card to invite a swipe) and for building a "confirm before swiping" flow.
  - `percent` is clamped to `0`–`1`. `peek(0, direction)` settles the card back to center.
  - `direction` is required. A direction that is not enabled is ignored, so `peek` can never reveal a pose the user could not reach by dragging.

**Example — wobble the card as a hint, then settle:**
```javascript
flashcardsRef.value.peek(0.15, 'right') // nudge ~15% to the right
setTimeout(() => flashcardsRef.value.peek(0, 'right'), 250) // settle back
```

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
