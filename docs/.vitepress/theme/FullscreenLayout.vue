<script setup>
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const { page } = useData()
const isFullscreen = page.value.relativePath === 'interactive-demo.md'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout v-if="!isFullscreen" />
  <div v-else class="fullscreen-layout">
    <Content />
  </div>
</template>

<style scoped>
.fullscreen-layout {
  min-height: 100vh;
  width: 100%;
  position: relative;
  background: var(--vp-c-bg);
}

.fullscreen-layout :deep(.VPContent) {
  padding: 0 !important;
  max-width: none !important;
}
</style>
