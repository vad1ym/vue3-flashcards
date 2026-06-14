# Swipe Directions

Control which directions cards can be swiped.

## Horizontal (Default)

Swipe left and right:

```vue
<FlashCards swipe-direction="horizontal" :items="cards">
  <!-- ... -->
</FlashCards>
```

Events: `@swipe-left`, `@swipe-right`

## Vertical

Swipe up and down:

```vue
<FlashCards swipe-direction="vertical" :items="cards">
  <!-- ... -->
</FlashCards>
```

Events: `@swipe-top`, `@swipe-bottom`

## Multi-Directional

Combine specific directions:

```vue
<FlashCards :swipe-direction="['left', 'right', 'top']" :items="cards">
  <!-- ... -->
</FlashCards>
```

All four directions:

```vue
<FlashCards :swipeDirection="['left', 'right', 'top', 'bottom']" :items="cards">
  <!-- ... -->
</FlashCards>
```

## Directional Slots

Add visual feedback shown while the user drags toward a direction. Each slot
receives a `delta` (0 to 1) — how far the card is toward that swipe — which is
handy for fading the indicator in:

```vue
<script setup>
import { ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'

const cards = ref([{ id: 1, title: 'Hello' }, { id: 2, title: 'World' }])
</script>

<template>
  <FlashCards :items="cards">
    <template #default="{ item }">
      <div class="card">
        {{ item.title }}
      </div>
    </template>

    <!-- Shown while dragging left / right; opacity follows the drag -->
    <template #left="{ delta }">
      <div class="badge nope" :style="{ opacity: delta }">
        NOPE
      </div>
    </template>
    <template #right="{ delta }">
      <div class="badge like" :style="{ opacity: delta }">
        LIKE
      </div>
    </template>
  </FlashCards>
</template>

<style scoped>
.card {
  width: 300px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.badge {
  position: absolute;
  top: 20px;
  padding: 6px 14px;
  font-weight: 700;
  border: 3px solid;
  border-radius: 8px;
}
.like {
  right: 20px;
  color: #22c55e;
  border-color: #22c55e;
}
.nope {
  left: 20px;
  color: #ef4444;
  border-color: #ef4444;
}
</style>
```

**See:** [Examples - Basic](../examples/basic-usage.md)
