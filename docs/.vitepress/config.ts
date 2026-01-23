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
      { text: 'Essentials', link: '/essentials/', activeMatch: '/essentials/' },
      { text: 'Advanced', link: '/advanced/', activeMatch: '/advanced/' },
      { text: 'Examples', link: '/examples/', activeMatch: '/examples/' },
      { text: 'API', link: '/api/', activeMatch: '/api/' },
      { text: 'Interactive Demo', link: '/interactive-demo', target: '_blank' },
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
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Guide Overview', link: '/guide/index' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Concepts', link: '/guide/basic-concepts' },
            { text: 'Migration from v0.x', link: '/guide/migration-from-v0' },
          ],
        },
        {
          text: 'Essentials',
          collapsed: false,
          items: [
            { text: 'Essentials Overview', link: '/essentials/index' },
            { text: 'Swipe Directions', link: '/essentials/swipe-directions' },
            { text: 'Card Content', link: '/essentials/card-content' },
            { text: 'Events', link: '/essentials/events' },
            { text: 'Actions', link: '/essentials/actions' },
            { text: 'Flip Cards', link: '/essentials/flip-cards' },
          ],
        },
        {
          text: 'Advanced',
          collapsed: true,
          items: [
            { text: 'Advanced Overview', link: '/advanced/index' },
            { text: 'Stack Configuration', link: '/advanced/stack-configuration' },
            { text: 'Virtual Rendering', link: '/advanced/virtual-rendering' },
            { text: 'Loop Mode', link: '/advanced/loop-mode' },
            { text: 'Custom Transforms', link: '/advanced/custom-transforms' },
            { text: 'Drag Limits', link: '/advanced/drag-limits' },
            { text: 'Transition Effects', link: '/advanced/transition-effects' },
          ],
        },
        {
          text: 'Examples',
          collapsed: true,
          items: [
            { text: 'All Examples', link: '/examples/index' },
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Flip Cards', link: '/examples/flip-cards' },
            { text: 'Custom Actions', link: '/examples/custom-actions' },
            { text: 'Drag Limits', link: '/examples/drag-limits' },
            { text: 'Delta Indicators', link: '/examples/delta-indicators' },
            { text: 'Tinder Style', link: '/examples/tinder-style' },
            { text: 'Stack Usage', link: '/examples/stack-usage' },
            { text: 'Virtual Rendering', link: '/examples/virtual-rendering' },
            { text: 'Infinite Loop', link: '/examples/infinite-loop' },
            { text: 'Scale Transform', link: '/examples/scale-transform' },
            { text: 'Transitions', link: '/examples/transitions' },
          ],
        },
      ],
      '/essentials/': [
        {
          text: 'Essentials',
          collapsed: false,
          items: [
            { text: 'Essentials Overview', link: '/essentials/index' },
            { text: 'Swipe Directions', link: '/essentials/swipe-directions' },
            { text: 'Card Content', link: '/essentials/card-content' },
            { text: 'Events', link: '/essentials/events' },
            { text: 'Actions', link: '/essentials/actions' },
            { text: 'Flip Cards', link: '/essentials/flip-cards' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: 'Advanced Features',
          collapsed: false,
          items: [
            { text: 'Advanced Overview', link: '/advanced/index' },
            { text: 'Stack Configuration', link: '/advanced/stack-configuration' },
            { text: 'Virtual Rendering', link: '/advanced/virtual-rendering' },
            { text: 'Loop Mode', link: '/advanced/loop-mode' },
            { text: 'Custom Transforms', link: '/advanced/custom-transforms' },
            { text: 'Drag Limits', link: '/advanced/drag-limits' },
            { text: 'Transition Effects', link: '/advanced/transition-effects' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'All Examples', link: '/examples/index' },
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Flip Cards', link: '/examples/flip-cards' },
            { text: 'Custom Actions', link: '/examples/custom-actions' },
            { text: 'Drag Limits', link: '/examples/drag-limits' },
            { text: 'Delta Indicators', link: '/examples/delta-indicators' },
            { text: 'Tinder Style', link: '/examples/tinder-style' },
            { text: 'Stack Usage', link: '/examples/stack-usage' },
            { text: 'Virtual Rendering', link: '/examples/virtual-rendering' },
            { text: 'Infinite Loop', link: '/examples/infinite-loop' },
            { text: 'Scale Transform', link: '/examples/scale-transform' },
            { text: 'Transitions', link: '/examples/transitions' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          collapsed: false,
          items: [
            { text: 'API Overview', link: '/api/index' },
            { text: 'FlashCards', link: '/api/flashcards' },
            { text: 'FlipCard', link: '/api/flipcard' },
          ],
        },
      ],
      '/': [
        {
          text: 'Guide',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Concepts', link: '/guide/basic-concepts' },
          ],
        },
        {
          text: 'Essentials',
          collapsible: true,
          collapsed: true,
          items: [
            { text: 'Swipe Directions', link: '/essentials/swipe-directions' },
            { text: 'Card Content', link: '/essentials/card-content' },
            { text: 'Events', link: '/essentials/events' },
            { text: 'Actions', link: '/essentials/actions' },
            { text: 'Flip Cards', link: '/essentials/flip-cards' },
          ],
        },
        {
          text: 'Advanced',
          collapsible: true,
          collapsed: true,
          items: [
            { text: 'Stack Configuration', link: '/advanced/stack-configuration' },
            { text: 'Virtual Rendering', link: '/advanced/virtual-rendering' },
            { text: 'Loop Mode', link: '/advanced/loop-mode' },
            { text: 'Custom Transforms', link: '/advanced/custom-transforms' },
            { text: 'Drag Limits', link: '/advanced/drag-limits' },
            { text: 'Transition Effects', link: '/advanced/transition-effects' },
          ],
        },
        {
          text: 'Examples',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'All Examples', link: '/examples/index' },
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Flip Cards', link: '/examples/flip-cards' },
            { text: 'Custom Actions', link: '/examples/custom-actions' },
            { text: 'Drag Limits', link: '/examples/drag-limits' },
            { text: 'Delta Indicators', link: '/examples/delta-indicators' },
            { text: 'Tinder Style', link: '/examples/tinder-style' },
            { text: 'Stack Usage', link: '/examples/stack-usage' },
            { text: 'Virtual Rendering', link: '/examples/virtual-rendering' },
            { text: 'Infinite Loop', link: '/examples/infinite-loop' },
            { text: 'Scale Transform', link: '/examples/scale-transform' },
            { text: 'Transitions', link: '/examples/transitions' },
          ],
        },
        {
          text: 'API Reference',
          collapsible: true,
          collapsed: true,
          items: [
            { text: 'FlashCards API', link: '/api/flashcards' },
            { text: 'FlipCard API', link: '/api/flipcard' },
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
