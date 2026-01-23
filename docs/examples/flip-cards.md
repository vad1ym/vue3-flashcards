---
outline: deep
---

<script setup>
import FlipUsage from '../../example/flip-usage/index.vue'
</script>

# Flip Cards

<Badge type="tip">Beginner</Badge>

Two-sided cards with flip animations. Click to flip, swipe to approve/reject.

## Demo

<ClientOnly>
  <FlipUsage />
</ClientOnly>

:::details Source
::: code-group
<<< ../../example/flip-usage/index.vue [index.vue]
<<< ../../example/flip-usage/QuestionCard.vue [QuestionCard.vue]
<<< ../../example/flip-usage/AnswerCard.vue [AnswerCard.vue]
:::

## Key Concepts

- **FlipCard component**: Independent two-sided card
- **flip-axis="x"**: Horizontal flip animation
- **flip() method**: Programmatically trigger flip
- Perfect for: flashcards, quiz apps, reveal content

## Related

- [Flip Cards Guide](../essentials/flip-cards.md)
