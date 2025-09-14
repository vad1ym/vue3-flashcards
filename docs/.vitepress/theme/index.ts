import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import FullscreenLayout from './FullscreenLayout.vue'
import './custom.css'
import '../../../example/assets/index.css'

export default {
  extends: DefaultTheme,
  Layout: FullscreenLayout,
} satisfies Theme
