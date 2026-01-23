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

Add visual feedback for each direction:

```vue
<template #left="{ delta }">NOPE</template>
<template #right="{ delta }">LIKE</template>
<template #top="{ delta }">SUPER LIKE</template>
```

The `delta` value (-1 to 1) indicates drag progress for animations.

**See:** [Examples - Basic](../examples/basic-usage.md)
