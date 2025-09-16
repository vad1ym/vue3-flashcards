import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import type { FlashCardsProps } from '../FlashCards.vue'
import type { FlipCardProps } from '../FlipCard.vue'
import { computed, inject, toValue } from 'vue'

/**
 * Typed injection keys for configs
 */
export const FlashCardsConfigKey: InjectionKey<FlashCardsProps<Record<string, unknown>>> = Symbol('flashcardsConfig')
export const FlipCardConfigKey: InjectionKey<FlipCardProps> = Symbol('flipCardConfig')

function useConfig<T extends Record<string, any>, U extends Record<string, any>>(defaults: U, localProps: MaybeRefOrGetter<T>) {
  return computed(() => ({
    ...defaults,
    ...Object.fromEntries(
      Object.entries(toValue(localProps))
        .filter(([_, v]) => v !== undefined),
    ),
  } as U & T))
}

/**
 * Composable to access global FlashCards configuration
 * and merge it with local props (local props take precedence)
 */
export function useFlashCardsConfig<T extends Record<string, any>>(localProps: MaybeRefOrGetter<T>) {
  const config = inject(FlashCardsConfigKey, {})
  return useConfig(config, localProps)
}

/**
 * Composable to access global FlipCard configuration
 * and merge it with local props (local props take precedence)
 */
export function useFlipCardConfig<T extends Record<string, any>>(localProps: MaybeRefOrGetter<T>) {
  const config = inject(FlipCardConfigKey, {})
  return useConfig(config, localProps)
}
