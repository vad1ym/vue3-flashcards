# Custom Transforms

Override default drag transforms with custom functions.

## transformStyle

Provide a custom transform function:

```vue
<script setup>
const customTransform = ({ deltaX, deltaY, rotation }) => {
  // Custom logic
  return `translate(${deltaX}px, ${deltaY}px) scale(${scale})`
}
</script>

<template>
  <FlashCards :transform-style="customTransform" :items="cards">
    <!-- ... -->
  </FlashCards>
</template>
```

## Function Signature

```typescript
type TransformStyle = (data: {
  deltaX: number      // Current drag X
  deltaY: number      // Current drag Y
  rotation: number    // Calculated rotation
  item: unknown       // Card data
  index: number       // Card index
}) => string          // CSS transform value
```

## Examples

### Scale Instead of Rotate

```typescript
const scaleTransform = ({ deltaX }) => {
  const scale = 1 - Math.abs(deltaX) / 1000
  return `translateX(${deltaX}px) scale(${Math.max(0.8, scale)})`
}
```

### 3D Perspective

```typescript
const perspectiveTransform = ({ deltaX, deltaY }) => {
  return `
    translate3d(${deltaX}px, ${deltaY}px, 0)
    rotateY(${deltaX / 10}deg)
    rotateX(${-deltaY / 10}deg)
  `
}
```

### No Transform

```typescript
const noTransform = () => 'none'
```

**See:** [Examples - Scale Transform](../examples/advanced/scale-transform.md)
