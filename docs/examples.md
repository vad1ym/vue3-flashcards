---
outline: deep
---

<script setup>
import BasicUsage from '../example/BasicUsage.vue'
import FlipUsage from '../example/FlipUsage.vue'
import CustomActionsUsage from '../example/CustomActionsUsage.vue'
import VirtualUsage from '../example/VirtualUsage.vue'
import TinderUsage from '../example/TinderUsage.vue'
</script>

# Examples

## Basic usage

<ClientOnly>
  <BasicUsage />
</ClientOnly>

:::details Source
<<< ../example/BasicUsage.vue
:::

## With flip usage

Click on card to flip

<ClientOnly>
  <FlipUsage />
</ClientOnly>

:::details Source
<<< ../example/FlipUsage.vue
:::

## With custom actions usage

<ClientOnly>
  <CustomActionsUsage />
</ClientOnly>

:::details Source
<<< ../example/CustomActionsUsage.vue
:::

## Virtual rendering with many cards

Efficiently handles large datasets by only rendering visible cards

<ClientOnly>
  <VirtualUsage />
</ClientOnly>

:::details Source
<<< ../example/VirtualUsage.vue
:::

## Tinder-like cards

Swipeable cards with beautiful images and Tinder-like interactions.
See how to use extra state for actions

<ClientOnly>
  <TinderUsage />
</ClientOnly>

:::details Source
<<< ../example/TinderUsage.vue
:::
