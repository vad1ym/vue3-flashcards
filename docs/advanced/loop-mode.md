# Loop Mode

Enable endless swiping through a fixed set of cards.

## Basic Usage

```vue
<FlashCards :loop="true" :items="cards">
  <!-- Cards cycle endlessly -->
</FlashCards>
```

When the last card is swiped, the first card returns to the stack.

## Loop Event

Listen for when the deck cycles:

```vue
<script setup>
function handleLoop() {
  console.log('All cards shown, starting over')
}
</script>

<template>
  <FlashCards :loop="true" :items="cards" @loop="handleLoop">
    <!-- ... -->
  </FlashCards>
</template>
```

## Use Cases

- **Practice modes**: Limited question set, repeat until mastery
- **Content feeds**: Small curated content that cycles
- **Showcases**: Product/features that repeat
- **Games**: Endless gameplay with fixed content

## Example

```vue
<FlashCards
  :loop="true"
  :items="['A', 'B', 'C']"
>
  <!-- Swipes: A → B → C → A → B → C → ... -->
</FlashCards>
```

**See:** [Examples - Infinite Loop](../examples/infinite-loop.md)
