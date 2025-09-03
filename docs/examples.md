---
outline: deep
---

<script setup>
import BasicUsage from '../example/basic-usage/index.vue'
import FlipUsage from '../example/flip-usage/index.vue'
import CustomActionsUsage from '../example/custom-actions/index.vue'
import VirtualUsage from '../example/virtual-usage/index.vue'
import TinderUsage from '../example/tinder-usage/index.vue'
import DeltaUsage from '../example/delta-usage/index.vue'
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
