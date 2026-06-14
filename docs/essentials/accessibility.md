# Accessibility

FlashCards is accessible **by default**. Without any configuration the deck is
keyboard-operable, exposes ARIA roles, announces what happens to screen readers,
respects reduced-motion preferences, and manages focus. For most apps there is
nothing to set up.

[[toc]]

## What you get out of the box

| Feature | Behavior |
|---|---|
| **Keyboard navigation** | Arrow keys swipe in the enabled directions; Enter / Space triggers the primary swipe; Backspace / `z` restores |
| **ARIA roles & labels** | The deck and the active card are labelled groups; off-screen cards are `aria-hidden` |
| **Live-region announcer** | Swipes, restores, and the empty state are announced (e.g. *"Card right, 4 remaining"*) |
| **Reduced motion** | Fly-out / restore animations snap instantly when the OS requests `prefers-reduced-motion` |
| **Focus management** | After a keyboard swipe, focus follows to the next active card |

All of it is controlled by the single grouped [`a11y`](../api/flashcards.md#a11y)
prop.

## Keyboard

When the deck (or a card inside it) has focus:

| Key | Action |
|---|---|
| `←` `→` `↑` `↓` | Swipe in that direction, if it is enabled by `swipeDirection` |
| `Enter` / `Space` | Swipe the primary positive direction (`right`, else the first enabled) |
| `Backspace` / `z` | Restore the previous card |
| `Escape` | Cancel a pending peek (see [confirm-on-key](#confirm-before-swiping)) |

The deck is focusable (`tabindex="0"`) so users can Tab to it. Arrow keys mapped
to disabled directions are ignored.

```vue
<!-- Vertical deck: ↑ / ↓ swipe, ← / → do nothing -->
<FlashCards :items="cards" swipe-direction="vertical" />
```

## Confirm before swiping

For a two-step "are you sure?" flow, enable `confirmOnKey`. The first arrow press
nudges the card to its full pre-swipe pose (via [`peek`](./actions.md#hint-peek))
and waits; a second matching arrow, or Enter / Space, confirms. Escape cancels.

```vue
<FlashCards :items="cards" :a11y="{ confirmOnKey: true }" />
```

## Announcements

A visually-hidden `aria-live` region announces each swipe, restore, and the empty
state. Tune the politeness or write your own messages:

```vue
<script setup>
function announce({ type, action, remaining }) {
  if (type === 'empty')
    return 'You reviewed every card'
  if (type === 'restore')
    return 'Brought the card back'
  return `Marked ${action}, ${remaining} to go`
}
</script>

<template>
  <FlashCards
    :items="cards"
    :a11y="{ liveMode: 'assertive', announce }"
  />
</template>
```

## Localization

Override the built-in English labels — they feed both the ARIA labels and the
default announcer:

```vue
<FlashCards
  :items="cards"
  :a11y="{
    labels: {
      deck: 'Колода',
      card: 'Карточка',
      right: 'вправо',
      left: 'влево',
      restore: 'возвращена',
      empty: 'Карточки закончились',
      instructions: 'Стрелки — свайп, Enter — подтвердить.',
    },
  }"
/>
```

## Reduced motion

When the operating system requests reduced motion
(`prefers-reduced-motion: reduce`), the swipe-out and restore animations collapse
to an instant snap and the skip "shimmer" is suppressed. This is automatic and
needs no configuration — it follows the system setting reactively.

## Turning it off

Pass `:a11y="false"` to remove **all** built-in accessibility wiring — the deck
loses its roles, the live region, keyboard handling, and focus management. Use
this only if you are providing your own accessibility layer.

```vue
<FlashCards :items="cards" :a11y="false" />
```

You can also disable individual pieces while keeping the rest:

```vue
<!-- Keep ARIA + announcer, but handle keys yourself -->
<FlashCards :items="cards" :a11y="{ keyboard: false }" />
```

## Reference

See the [`a11y` prop](../api/flashcards.md#a11y) in the API reference for the
complete option list and types (`A11yOptions`, `A11yAnnounceEvent`).
