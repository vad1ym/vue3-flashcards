# FlashCards API

The main component for creating swipeable card interfaces.

## Props

### `items` <Badge type="danger" text="required" />

- **Type:** `T[]`
- **Description:** Array of items to display as cards. Each item will be passed to the default and back slots.

### `maxRotation`

- **Type:** `number`
- **Default:** `20`
- **Description:** Maximum rotation angle in degrees when swiping cards.

### `threshold`

- **Type:** `number`
- **Default:** `150`
- **Description:** Threshold in pixels for swipe actions. Cards must be swiped beyond this distance to trigger approve/reject.

### `dragThreshold`

- **Type:** `number`
- **Default:** `5`
- **Description:** Minimum distance in pixels the card must be dragged to start swiping. Helps prevent false positives from small movements like clicks.

### `maxDraggingY`

- **Type:** `number | null`
- **Default:** `null`
- **Description:** Maximum Y dragging distance in pixels. When set, limits vertical card movement. Set to `null` for unlimited vertical dragging.

### `maxDraggingX`

- **Type:** `number | null`
- **Default:** `null`
- **Description:** Maximum X dragging distance in pixels. When set, limits horizontal card movement. Set to `null` for unlimited horizontal dragging.

### `virtualBuffer`

- **Type:** `number`
- **Default:** `2`
- **Description:** Number of cards to render before/after the current card. Used for virtual rendering with large datasets. A value of 2 means 5 cards total will be rendered (current + 2 before + 2 after).

## Slots

### `default`

- **Props:** `{ item: T }`
- **Description:** Main content of the card (front side).

```vue
<template>
  <FlashCards :items="cards">
    <template #default="{ item }">
      <div class="card-content">
        {{ item.title }}
      </div>
    </template>
  </FlashCards>
</template>
```

### `actions`

- **Props:** `{ restore: () => void, reject: () => void, approve: () => void, isEnd: boolean, canRestore: boolean }`
- **Description:** Custom actions UI for controlling card behavior programmatically.

```vue
<template>
  <FlashCards :items="cards">
    <template #actions="{ approve, reject, restore, isEnd, canRestore }">
      <div class="action-buttons">
        <button :disabled="isEnd" @click="reject">
          ❌
        </button>
        <button :disabled="!canRestore" @click="restore">
          ↩️
        </button>
        <button :disabled="isEnd" @click="approve">
          ✅
        </button>
      </div>
    </template>
  </FlashCards>
</template>
```

### `approve`

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping right (approval indicator). The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the approval threshold.

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

### `reject`

- **Props:** `{ item: T, delta: number }`
- **Description:** Content shown when swiping left (rejection indicator). The `delta` value ranges from 0 to 1, where 0 means the card is static and 1 means the card is at the rejection threshold.

```vue
<template #reject="{ item, delta }">
  <div
    class="reject-indicator"
    :style="{ opacity: delta }"
  >
    ❌ Pass
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

### `approve`

- **Payload:** `item: T`
- **Description:** Emitted when a card is approved (swiped right or approved via actions).

### `reject`

- **Payload:** `item: T`
- **Description:** Emitted when a card is rejected (swiped left or rejected via actions).

```vue
<script setup>
function handleApprove(item) {
  console.log('Approved:', item)
  // Add to approved list, save to database, etc.
}

function handleReject(item) {
  console.log('Rejected:', item)
  // Add to rejected list, save to database, etc.
}
</script>

<template>
  <FlashCards
    :items="cards"
    @approve="handleApprove"
    @reject="handleReject"
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

function programmaticApprove() {
  flashcardsRef.value.approve()
}
</script>

<template>
  <FlashCards ref="flashcardsRef" :items="cards" />
  <button @click="programmaticApprove">
    Approve
  </button>
</template>
```

### `restore()`

- **Type:** `() => void`
- **Description:** Returns to the previous card if available.

### `approve()`

- **Type:** `() => void`
- **Description:** Triggers approval animation on the current card.

### `reject()`

- **Type:** `() => void`
- **Description:** Triggers rejection animation on the current card.

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
