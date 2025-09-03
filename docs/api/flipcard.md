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

## Slots

### `front`

- **Description:** Content shown on the front of the card.

```vue
<template>
  <FlipCard>
    <template #front>
      <div class="card-front">
        <h3>Question</h3>
        <p>What is the capital of France?</p>
      </div>
    </template>
  </FlipCard>
</template>
```

### `back`

- **Description:** Content shown on the back of the card. If not provided, the card will not flip.

```vue
<template>
  <FlipCard>
    <template #front>
      <div class="card-front">Question</div>
    </template>
    <template #back>
      <div class="card-back">Answer: Paris</div>
    </template>
  </FlipCard>
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
    <template #front>Front</template>
    <template #back>Back</template>
  </FlipCard>

  <!-- Allows immediate flipping (might cause visual issues) -->
  <FlipCard :wait-animation-end="false">
    <template #front>Front</template>
    <template #back>Back</template>
  </FlipCard>
</template>
```


