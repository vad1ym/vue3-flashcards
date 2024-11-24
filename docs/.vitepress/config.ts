import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vue3-flashcards/',
  title: 'Vue3 Flashcards',
  description: 'A Tinder-like flashcards component for Vue 3 with dragging and flipping animations. Built with TypeScript and Vue 3 Composition API.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs' },
      { text: 'Examples', link: '/examples' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/docs' },
          { text: 'Examples', link: '/examples' },
          // { text: 'Props', link: '/docs#props' },
          // { text: 'Slots', link: '/docs#slots' },
          // { text: 'Events', link: '/docs#events' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vad1ym/vue3-flashcards' },
    ],

    footer: {
      message: '⚠️ Development Notice: This package is currently in development. The API may change between minor versions until v1.0.0 is released.',
    },
  },
})
