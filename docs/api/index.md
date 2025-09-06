# API Reference

Complete API documentation for Vue3 Flashcards components.

## Components

### [FlashCards](/api/flashcards)

The main component for creating swipeable card interfaces with Tinder-like interactions.

**Key Features:**
- Swipe gestures (left/right)
- Customizable thresholds and animations  
- Virtual rendering for performance
- Flexible slot system
- Event handling for approve/reject actions

```vue
<template>
  <FlashCards :items="cards" @approve="onApprove" @reject="onReject">
    <template #default="{ item }">
      <div>{{ item.content }}</div>
    </template>
  </FlashCards>
</template>
```

### [FlipCard](/api/flipcard)

A standalone component for creating cards with flip animations.

**Key Features:**
- Front/back content slots
- Click-to-flip functionality
- Animation controls
- Can be used independently or within FlashCards

```vue
<template>
  <FlipCard>
    <template #front>Question</template>
    <template #back>Answer</template>
  </FlipCard>
</template>
```

## Type Definitions

Vue3 Flashcards provides comprehensive TypeScript definitions:

```typescript
// Component instance types
import type { FlashCardsInstance, FlipCardInstance } from 'vue3-flashcards'

// Generic item types
interface CardItem {
  id: string | number
  [key: string]: any
}

// Event payload types
type ApproveEvent<T> = T
type RejectEvent<T> = T
```

## Global Configuration

You can configure default behavior globally:

```typescript
// main.ts
import { createApp } from 'vue'
import { Vue3Flashcards } from 'vue3-flashcards'

const app = createApp(App)

app.use(Vue3Flashcards, {
  // Global defaults
  maxRotation: 25,
  threshold: 120,
  dragThreshold: 8, 
  disableVerticalDrag: false
})
```

## Browser Support

Vue3 Flashcards supports all modern browsers:

| Browser | Version |
|---------|---------|
| Chrome  | ≥ 88    |
| Firefox | ≥ 78    |
| Safari  | ≥ 14    |
| Edge    | ≥ 88    |

## Performance Considerations

- Use `virtualBuffer` prop for large datasets (1000+ items)
- Implement proper cleanup in component lifecycle
- Consider lazy loading for complex card content
- Use CSS transforms for optimal animations

## Accessibility

Components include basic accessibility features:

- Keyboard navigation support
- ARIA attributes where appropriate  
- Screen reader compatibility
- Focus management

For enhanced accessibility, consider:
- Adding custom ARIA labels
- Implementing keyboard shortcuts
- Providing alternative interaction methods
- Testing with screen readers