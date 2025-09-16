import type { FlashCardsProps } from '../src/FlashCards.vue'
import { addComponent, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions extends Partial<FlashCardsProps<any>> {
  // Global configuration options for FlashCards
}

// Augment Nuxt config types
declare module '@nuxt/schema' {
  interface NuxtConfig {
    flashcards?: ModuleOptions
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    flashcards?: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue3-flashcards',
    configKey: 'flashcards',
  },
  defaults: {},
  setup(options: ModuleOptions, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Register components globally
    addComponent({
      name: 'FlashCards',
      filePath: resolver.resolve('../src/FlashCards.vue'),
      global: true,
    })

    addComponent({
      name: 'FlipCard',
      filePath: resolver.resolve('../src/FlipCard.vue'),
      global: true,
    })

    // Generate plugin template with inlined config
    addTemplate({
      filename: 'vue3-flashcards.plugin.mjs',
      getContents: () => `
import { defineNuxtPlugin } from '#app'
import vuePlugin from '${resolver.resolve('../src/plugin')}'

export default defineNuxtPlugin((nuxtApp) => {
  const config = ${JSON.stringify(options, null, 2)}

  nuxtApp.vueApp.use(vuePlugin, {
    flashCards: config,
    registerComponents: false,
  })
})
      `,
    })

    // Register the generated plugin
    nuxt.options.plugins.push('#build/vue3-flashcards.plugin.mjs')

    // Add TypeScript declarations for global components
    addTemplate({
      filename: 'types/vue3-flashcards.d.ts',
      getContents: () => `
import type { FlashCardsProps } from '${resolver.resolve('../src/FlashCards.vue')}'
import type { FlipCardProps } from '${resolver.resolve('../src/FlipCard.vue')}'

declare module 'vue' {
  export interface GlobalComponents {
    FlashCards: typeof import('${resolver.resolve('../src/FlashCards.vue')}')['default']
    FlipCard: typeof import('${resolver.resolve('../src/FlipCard.vue')}')['default']
  }
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    FlashCards: typeof import('${resolver.resolve('../src/FlashCards.vue')}')['default']
    FlipCard: typeof import('${resolver.resolve('../src/FlipCard.vue')}')['default']
  }
}

export {}
      `,
    })
  },
})
