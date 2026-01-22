# Tinder-like Usage Example

This example demonstrates the new 4-directional swipe system with left/right/top actions, similar to popular dating apps.

## Features

- **Left Swipe**: Reject/Nope ❌
- **Right Swipe**: Like ❤️
- **Up Swipe**: Super Like ⭐

## Implementation Details

### Configuration
```vue
<FlashCards
  :items="items"
  swipe-direction="['left', 'right', 'top']"
  @swipe-left="(item) => handleSwipe(item, 'left')"
  @swipe-right="(item) => handleSwipe(item, 'right')"
  @swipe-top="(item) => handleSwipe(item, 'top')"
>
```

### Directional Slots
- `#left`: Shows "NOPE" indicator when swiping left
- `#right`: Shows "LIKE" indicator when swiping right
- `#top`: Shows "SUPER LIKE" indicator when swiping up

### Action Buttons
- **Restore**: Undo last action
- **Nope**: Reject current card
- **Super Like**: Special like with star animation
- **Like**: Standard like

## Visual Indicators

The example provides real-time visual feedback:
- **Swipe indicators** appear during drag with delta values
- **Button actions** trigger the same directional logic
- **Console logging** shows swipe direction and special actions

## Usage

1. **Mouse/Touch**: Drag cards left, right, or up
2. **Buttons**: Use action buttons below the cards
3. **Visual Feedback**: Watch for directional indicators during swipes

## Key Features Demonstrated

- ✅ Multi-directional swipe configuration
- ✅ Custom directional slots with real-time feedback
- ✅ Directional event handling
- ✅ Button integration with directional actions
- ✅ Backward compatibility with existing approve/reject actions
- ✅ Visual feedback and animations

This example showcases the full potential of the new 4-directional swipe system while maintaining the familiar Tinder-like user experience.
