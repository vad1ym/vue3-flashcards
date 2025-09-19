---
outline: deep
---

<script setup>
import BasicUsage from '../example/basic-usage/index.vue'
import LimitUsage from '../example/limit-usage/index.vue'
import FlipUsage from '../example/flip-usage/index.vue'
import CustomActionsUsage from '../example/custom-actions/index.vue'
import VirtualUsage from '../example/virtual-usage/index.vue'
import TinderUsage from '../example/tinder-usage/index.vue'
import DeltaUsage from '../example/delta-usage/index.vue'
import ScaleUsage from '../example/scale-usage/index.vue'
import StackUsage from '../example/stack-usage/index.vue'
import InfiniteUsage from '../example/infinite-usage/index.vue'
import TransitionEffectsUsage from '../example/transition-effects/index.vue'
</script>

# Live Examples

Interactive demos showcasing different features and use cases.

## 🚀 Basic Usage

Simple swipeable cards with minimal setup.

<ClientOnly>
  <BasicUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/basic-usage/index.vue [index.vue]
<<< ../example/basic-usage/BasicCard.vue [BasicCard.vue]
:::

## 🚧 Drag Limits

Demonstrate drag limits with checkboxes to toggle Y dragging (0px) and X dragging (200px) constraints.

<ClientOnly>
  <LimitUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/limit-usage/index.vue [index.vue]
<<< ../example/limit-usage/LimitCard.vue [LimitCard.vue]
:::

## 🔄 FlipCard Integration

Two-sided cards with flip animations. Click to flip, swipe to approve or reject.

<ClientOnly>
  <FlipUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/flip-usage/index.vue [index.vue]
<<< ../example/flip-usage/QuestionCard.vue [QuestionCard.vue]
<<< ../example/flip-usage/AnswerCard.vue [AnswerCard.vue]
:::

## 🎮 Custom Actions

Custom action buttons with manual card controls.

<ClientOnly>
  <CustomActionsUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/custom-actions/index.vue [index.vue]
<<< ../example/custom-actions/LearningCard.vue [LearningCard.vue]
<<< ../example/custom-actions/ActionButtons.vue [ActionButtons.vue]
:::

## ⚡ Virtual Rendering

Efficient rendering for large datasets (10,000+ cards).

<ClientOnly>
  <VirtualUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/virtual-usage/index.vue [index.vue]
<<< ../example/virtual-usage/VirtualCard.vue [VirtualCard.vue]
:::

## 💖 Tinder-Style Cards

Image-based cards with visual swipe indicators and smooth animations.

<ClientOnly>
  <TinderUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/tinder-usage/index.vue [index.vue]
<<< ../example/tinder-usage/TinderCard.vue [TinderCard.vue]
<<< ../example/tinder-usage/TinderActions.vue [TinderActions.vue]
:::

## 🎯 Delta Usage

Custom swiping indicators with dynamic opacity transitions.

<ClientOnly>
  <DeltaUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/delta-usage/index.vue [index.vue]
<<< ../example/delta-usage/LanguageCard.vue [LanguageCard.vue]
<<< ../example/delta-usage/SwipeOverlay.vue [SwipeOverlay.vue]
:::

## 📏 Scale Transform

Custom transform that scales cards instead of rotating them during swipe gestures.

<ClientOnly>
  <ScaleUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/scale-usage/index.vue [index.vue]
<<< ../example/scale-usage/ScaleCard.vue [ScaleCard.vue]
:::

## 📚 Stack Configuration

Interactive stack controls with adjustable size (3-10 cards) and directional positioning (top, bottom, left, right).

<ClientOnly>
  <StackUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/stack-usage/index.vue [index.vue]
<<< ../example/stack-usage/StackCard.vue [StackCard.vue]
:::

## ♾️ Loop Swiping

Endless card swiping with only 3 cards that loop.

<ClientOnly>
  <InfiniteUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/infinite-usage/index.vue [index.vue]
<<< ../example/infinite-usage/InfiniteCard.vue [InfiniteCard.vue]
:::

## 🎭 Transition Effects

Custom transition animations with fast rotating, scaling, 3D flips, and elastic bounce effects.

<ClientOnly>
  <TransitionEffectsUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../example/transition-effects/index.vue [index.vue]
<<< ../example/transition-effects/TransitionCard.vue [TransitionCard.vue]
:::
