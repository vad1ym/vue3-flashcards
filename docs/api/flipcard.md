# FlipCard API

A standalone component for creating flippable cards with front and back content.

## Props

### `disabled`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Disable card flipping functionality. When `true`, the card cannot be flipped.

### `waitAnimationEnd`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Wait for the flip animation to complete before allowing another flip. Prevents rapid clicking issues.

### `flipAxis`

- **Type:** `'x' | 'y'`
- **Default:** `'y'`
- **Description:** Axis of rotation for the flip animation. Use `'x'` for horizontal flip (top to bottom) or `'y'` for vertical flip (left to right).

## Slots

### `front`

- **Props:** `{ flip: () => void }`
- **Description:** Content shown on the front of the card. Receives `flip` method for programmatic flipping.

```vue
<template>
  <FlipCard>
    <template #front="{ flip }">
      <div class="card-front">
        <h3>Question</h3>
        <p>What is the capital of France?</p>
        <button @click="flip">
          Reveal Answer
        </button>
      </div>
    </template>
  </FlipCard>
</template>
```

### `back`

- **Props:** `{ flip: () => void }`
- **Description:** Content shown on the back of the card. If not provided, the card will not flip. Receives `flip` method for programmatic flipping.

```vue
<template>
  <FlipCard>
    <template #front="{ flip }">
      <div class="card-front" @click="flip">
        Question
      </div>
    </template>
    <template #back="{ flip }">
      <div class="card-back">
        <p>Answer: Paris</p>
        <button @click="flip">
          Back to Question
        </button>
      </div>
    </template>
  </FlipCard>
</template>
```

## Events

### `flip`

- **Type:** `(isFlipped: boolean) => void`
- **Description:** Emitted when the card is flipped. The payload indicates the current state: `true` when showing back side, `false` when showing front side.

```vue
<script setup>
function onFlip(isFlipped) {
  console.log('Card is now showing:', isFlipped ? 'back' : 'front')
}
</script>

<template>
  <FlipCard @flip="onFlip">
    <template #front>
      Front Side
    </template>
    <template #back>
      Back Side
    </template>
  </FlipCard>
</template>
```

## Exposed Methods

### `flip()`

- **Type:** `() => void`
- **Description:** Programmatically flip the card. This method respects the `disabled` and `waitAnimationEnd` props.

```vue
<script setup>
import { ref } from 'vue'

const flipCardRef = ref()

function flipProgrammatically() {
  flipCardRef.value.flip()
}
</script>

<template>
  <div>
    <button @click="flipProgrammatically">
      Flip Card
    </button>
    <FlipCard ref="flipCardRef">
      <template #front>
        Front Side
      </template>
      <template #back>
        Back Side
      </template>
    </FlipCard>
  </div>
</template>
```

## Usage Examples

### Basic FlipCard

```vue
<script setup>
import { FlipCard } from 'vue3-flashcards'
</script>

<template>
  <FlipCard>
    <template #front>
      <div class="card-side front">
        <h3>Front Side</h3>
        <p>Click to flip</p>
      </div>
    </template>
    <template #back>
      <div class="card-side back">
        <h3>Back Side</h3>
        <p>Click to flip back</p>
      </div>
    </template>
  </FlipCard>
</template>
```

### FlipCard with FlashCards

Combine FlipCard with FlashCards for advanced flashcard functionality:

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards, FlipCard } from 'vue3-flashcards'

const cards = ref([
  {
    id: 1,
    question: 'What is Vue.js?',
    answer: 'A progressive JavaScript framework'
  },
  {
    id: 2,
    question: 'What is composition API?',
    answer: 'A new way to organize component logic in Vue 3'
  },
])
</script>

<template>
  <FlashCards :items="cards">
    <template #default="{ item }">
      <FlipCard>
        <template #front>
          <div class="question-card">
            <h3>Question</h3>
            <p>{{ item.question }}</p>
            <small>Click to see answer</small>
          </div>
        </template>
        <template #back>
          <div class="answer-card">
            <h3>Answer</h3>
            <p>{{ item.answer }}</p>
          </div>
        </template>
      </FlipCard>
    </template>
  </FlashCards>
</template>
```

### Disabled FlipCard

```vue
<template>
  <FlipCard :disabled="!allowFlipping">
    <template #front>
      <div class="locked-card">
        <h3>🔒 Locked</h3>
        <p>Complete previous level to unlock</p>
      </div>
    </template>
  </FlipCard>
</template>
```

### Fast Flipping Prevention

```vue
<template>
  <!-- Prevents rapid clicking by waiting for animation -->
  <FlipCard :wait-animation-end="true">
    <template #front>
      Front
    </template>
    <template #back>
      Back
    </template>
  </FlipCard>

  <!-- Allows immediate flipping (might cause visual issues) -->
  <FlipCard :wait-animation-end="false">
    <template #front>
      Front
    </template>
    <template #back>
      Back
    </template>
  </FlipCard>
</template>
```

### Flip Axis Options

```vue
<template>
  <!-- Vertical flip (default) - rotates around Y axis -->
  <FlipCard flip-axis="y">
    <template #front>
      Front - Vertical Flip
    </template>
    <template #back>
      Back - Vertical Flip
    </template>
  </FlipCard>

  <!-- Horizontal flip - rotates around X axis -->
  <FlipCard flip-axis="x">
    <template #front>
      Front - Horizontal Flip
    </template>
    <template #back>
      Back - Horizontal Flip
    </template>
  </FlipCard>
</template>
```
