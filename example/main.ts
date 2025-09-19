import { createApp } from 'vue'
import { FlashCardsPlugin } from 'vue3-flashcards'
import BasicUsage from './basic-usage/index.vue'
import './assets/index.css'

const app = createApp(BasicUsage)
app.use(FlashCardsPlugin, {
  flashCards: {
    loop: true,
  },
})
app.mount('#app')
