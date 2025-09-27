import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'vue3-flashcards': resolve(__dirname, '../../src/index.ts'),
      },
    },
  },
  base: '/vue3-flashcards/',
  title: 'Vue3 Flashcards',
  description: 'A Tinder-like flashcards component for Vue 3 with dragging and flipping animations. Built with TypeScript and Vue 3 Composition API.',
  head: [
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'Vue3 Flashcards' }],
    ['meta', { name: 'og:image', content: '/vue3-flashcards/logo.png' }],
  ],
  themeConfig: {
    logo: { src: '/logo.png', width: 24, height: 24 },

    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/flashcards', activeMatch: '/api/' },
      { text: 'Examples', link: '/examples' },
      { text: 'Interactive Demo', link: '/interactive-demo', target: '_blank' },
      { text: 'Releases', link: 'https://github.com/vad1ym/vue3-flashcards/releases' },
      {
        text: `v${version}`,
        items: [
          {
            text: `Release v${version}`,
            link: `https://github.com/vad1ym/vue3-flashcards/releases/tag/v${version}`,
          },
          {
            text: 'All Releases',
            link: 'https://github.com/vad1ym/vue3-flashcards/releases',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/vad1ym/vue3-flashcards/blob/main/CONTRIBUTING.md',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          collapsed: false,
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Migration from v0.x', link: '/guide/migration-from-v0' },
          ],
        },
        {
          text: 'Resources',
          collapsed: false,
          items: [
            { text: 'Examples', link: '/examples' },
            { text: 'Interactive Demo', link: '/interactive-demo' },
            { text: 'Releases', link: 'https://github.com/vad1ym/vue3-flashcards/releases' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'FlashCards', link: '/api/flashcards' },
            { text: 'FlipCard', link: '/api/flipcard' },
          ],
        },
      ],
      '/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Migration from v0.x', link: '/guide/migration-from-v0' },
            { text: 'Examples', link: '/examples' },
            { text: 'Interactive Demo', link: '/interactive-demo' },
          ],
        },
        {
          text: 'API Reference',
          items: [
            { text: 'FlashCards', link: '/api/flashcards' },
            { text: 'FlipCard', link: '/api/flipcard' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vad1ym/vue3-flashcards' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/vue3-flashcards' },
    ],

    editLink: {
      pattern: 'https://github.com/vad1ym/vue3-flashcards/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present vad1ym',
    },
  },
})
