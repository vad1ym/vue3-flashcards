import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import '../../../example/assets/index.css'

export default {
  extends: DefaultTheme,
} satisfies Theme
