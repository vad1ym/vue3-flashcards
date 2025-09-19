<script lang="ts" setup>
import type { ConfigPanelProps } from './ConfigPanel.vue'
import type { CardItem } from './InteractiveCard.vue'
import { computed, ref } from 'vue'
import { FlashCards } from 'vue3-flashcards'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import Actions from './Actions.vue'
import ConfigPanel from './ConfigPanel.vue'
import EmptyState from './EmptyState.vue'
import EventsLog from './EventsLog.vue'
import InteractiveCard from './InteractiveCard.vue'
import ItemsManager from './ItemsManager.vue'

interface Event {
  type: 'approve' | 'reject' | 'restore'
  item: CardItem
  timestamp: string
}

const defaultConfig = {
  ...flashCardsDefaults,
  waitAnimationEnd: false,
  infinite: false,
  stackDirection: 'bottom' as 'top' | 'bottom' | 'left' | 'right',
  maxDragX: null,
  maxDragY: null,
  disableDrag: false,
}

// Configuration reactive object
const config = ref<ConfigPanelProps>(defaultConfig)

// Drag limits toggles
const enableXLimit = ref(false)
const enableYLimit = ref(false)

// Force re-render when config changes significantly
const configKey = computed(() => JSON.stringify(config))

// Events log
const events = ref<Event[]>([])
const eventsLogRef = ref<InstanceType<typeof EventsLog>>()

// Mobile sidebar states
const showEventsSidebar = ref(false)
const showConfigSidebar = ref(false)

// Sample cards
const defaultItems: CardItem[] = [
  { id: 1, emoji: '🎨', title: 'Art & Design', subtitle: 'Creative visual expressions', color: 'from-pink-500 to-rose-500' },
  { id: 2, emoji: '🎵', title: 'Music', subtitle: 'Rhythm and melody', color: 'from-purple-500 to-indigo-500' },
  { id: 3, emoji: '📚', title: 'Books', subtitle: 'Knowledge and stories', color: 'from-blue-500 to-cyan-500' },
  { id: 4, emoji: '🎮', title: 'Gaming', subtitle: 'Interactive entertainment', color: 'from-green-500 to-teal-500' },
  { id: 5, emoji: '🍕', title: 'Food', subtitle: 'Culinary delights', color: 'from-yellow-500 to-orange-500' },
  { id: 6, emoji: '✈️', title: 'Travel', subtitle: 'Explore the world', color: 'from-indigo-500 to-purple-500' },
  { id: 7, emoji: '🎬', title: 'Movies', subtitle: 'Cinematic experiences', color: 'from-red-500 to-pink-500' },
  { id: 8, emoji: '🏃', title: 'Sports', subtitle: 'Physical activities', color: 'from-emerald-500 to-green-500' },
  { id: 9, emoji: '🔬', title: 'Science', subtitle: 'Discovery and innovation', color: 'from-cyan-500 to-blue-500' },
  { id: 10, emoji: '💡', title: 'Technology', subtitle: 'Digital innovation', color: 'from-amber-500 to-yellow-500' },
]

const items = ref<CardItem[]>([...defaultItems])

let nextId = Math.max(...defaultItems.map(item => item.id)) + 1

// Event handlers
function onApprove(item: CardItem) {
  events.value.push({
    type: 'approve',
    item,
    timestamp: new Date().toLocaleTimeString(),
  })
  eventsLogRef.value?.scrollToBottom()
}

function onReject(item: CardItem) {
  events.value.push({
    type: 'reject',
    item,
    timestamp: new Date().toLocaleTimeString(),
  })
  eventsLogRef.value?.scrollToBottom()
}

function onRestore(item: CardItem) {
  events.value.push({
    type: 'restore',
    item,
    timestamp: new Date().toLocaleTimeString(),
  })
  eventsLogRef.value?.scrollToBottom()
}

// Item management
function addItem() {
  const emojis = ['🌟', '🔥', '💎', '🚀', '⭐', '🎯', '💫', '🌈', '🦄', '🎪']
  const titles = ['New Card', 'Fresh Item', 'Cool Stuff', 'Awesome', 'Amazing', 'Fantastic', 'Wonderful', 'Brilliant']
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-red-500 to-pink-500',
    'from-emerald-500 to-green-500',
  ]

  const newItem: CardItem = {
    id: nextId++,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    title: `${titles[Math.floor(Math.random() * titles.length)]} ${nextId - 1}`,
    subtitle: 'Dynamically generated item',
    color: colors[Math.floor(Math.random() * colors.length)],
  }

  items.value.push(newItem)
}

function removeItem() {
  if (items.value.length > 1) {
    items.value.pop()
  }
}

function resetItems() {
  items.value = [...defaultItems]
  nextId = Math.max(...defaultItems.map(item => item.id)) + 1
}

function clearEvents() {
  events.value = []
}

function resetConfig() {
  config.value = defaultConfig
  enableXLimit.value = false
  enableYLimit.value = false
}
</script>

<template>
  <div class="min-h-screen bg-base-100 p-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-lg md:text-4xl font-bold text-base-content mb-2">
          🎮 Interactive FlashCards Demo
        </h1>
        <p class="text-xs md:text-base text-base-content/70">
          Configure all properties and see changes in real-time
        </p>
      </div>

      <!-- Mobile Control Buttons -->
      <div class="lg:hidden flex justify-center gap-4 mb-4">
        <button
          class="btn btn-primary btn-sm"
          @click="showEventsSidebar = true"
        >
          📊 Events
        </button>
        <button
          class="btn btn-secondary btn-sm"
          @click="showConfigSidebar = true"
        >
          ⚙️ Config
        </button>
      </div>

      <!-- Main Layout: Desktop 50/50 Split, Mobile Single Column -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:h-[calc(100vh-14rem)]" style="min-height: 700px;">
        <!-- Left Column: Desktop 80/20 Split (FlashCards + Events), Mobile FlashCards Only -->
        <div class="flex flex-col gap-4 h-full overflow-hidden">
          <!-- FlashCards Component -->
          <div class="overflow-hidden lg:h-[calc(80%-0.8rem)] h-full">
            <div class="card bg-base-200 shadow-lg h-full">
              <div class="card-body flex flex-col h-full">
                <h2 class="card-title mb-4 flex-shrink-0">
                  🎴 FlashCards Component
                </h2>
                <div class="flex justify-center flex-1 items-center">
                  <div class="w-full max-w-sm">
                    <FlashCards
                      :key="configKey"
                      :items="items"
                      :infinite="config.infinite"
                      :render-limit="config.renderLimit"
                      :stack="config.stack"
                      :stack-offset="config.stackOffset"
                      :stack-scale="config.stackScale"
                      :stack-direction="config.stackDirection"
                      :swipe-threshold="config.swipeThreshold"
                      :drag-threshold="config.dragThreshold"
                      :max-rotation="config.maxRotation"
                      :max-drag-x="enableXLimit ? config.maxDragX : null"
                      :max-drag-y="enableYLimit ? config.maxDragY : null"
                      :disable-drag="config.disableDrag"
                      :wait-animation-end="config.waitAnimationEnd"
                      track-by="id"
                      @approve="onApprove"
                      @reject="onReject"
                      @restore="onRestore"
                    >
                      <template #default="{ item }">
                        <InteractiveCard :item="item" />
                      </template>

                      <template #approve="{ delta }">
                        <div class="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div class="text-green-500 text-4xl font-bold" :style="{ opacity: Math.abs(delta) }">
                            ✓ LIKE
                          </div>
                        </div>
                      </template>

                      <template #reject="{ delta }">
                        <div class="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <div class="text-red-500 text-4xl font-bold" :style="{ opacity: Math.abs(delta) }">
                            ✗ PASS
                          </div>
                        </div>
                      </template>

                      <template #actions="{ restore, reject, approve, reset, isEnd, isStart, canRestore }">
                        <Actions
                          :is-end="isEnd"
                          :is-start="isStart"
                          :can-restore="canRestore"
                          :infinite="config.infinite"
                          @restore="restore"
                          @reject="reject"
                          @approve="approve"
                          @reset="reset"
                        />
                      </template>

                      <template #empty="{ reset }">
                        <EmptyState @reset-items="reset" />
                      </template>
                    </FlashCards>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Events Log (Hidden on Mobile) -->
          <div class="hidden lg:block overflow-hidden md:h-[20%]">
            <EventsLog
              ref="eventsLogRef"
              :events="events"
              @clear-events="clearEvents"
            />
          </div>
        </div>

        <!-- Desktop Right Column: Configuration (Hidden on Mobile) -->
        <div class="hidden lg:block space-y-6 h-full overflow-y-auto">
          <ItemsManager
            :items="items"
            @add-item="addItem"
            @remove-item="removeItem"
            @reset-items="resetItems"
            @reset-config="resetConfig"
          />

          <ConfigPanel
            :config="config"
            :enable-x-limit="enableXLimit"
            :enable-y-limit="enableYLimit"
            @update:config="config = $event"
            @update:enable-x-limit="enableXLimit = $event"
            @update:enable-y-limit="enableYLimit = $event"
          />
        </div>
      </div>

      <!-- Mobile Events Sidebar -->
      <div
        v-if="showEventsSidebar"
        class="lg:hidden fixed inset-0 z-50 bg-black/50"
        @click="showEventsSidebar = false"
      >
        <div
          class="fixed right-0 top-0 h-full w-80 max-w-[80vw] bg-base-100 shadow-xl transform transition-transform duration-300 ease-in-out"
          @click.stop
        >
          <div class="flex flex-col h-full">
            <div class="flex items-center justify-between p-4 border-b border-base-300">
              <h3 class="text-lg font-semibold">
                📊 Events Log
              </h3>
              <button
                class="btn btn-ghost btn-sm btn-circle"
                @click="showEventsSidebar = false"
              >
                ✕
              </button>
            </div>
            <div class="flex-1 p-4">
              <EventsLog
                ref="eventsLogRef"
                :events="events"
                @clear-events="clearEvents"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Config Sidebar -->
      <div
        v-if="showConfigSidebar"
        class="lg:hidden fixed inset-0 z-50 bg-black/50"
        @click="showConfigSidebar = false"
      >
        <div
          class="fixed left-0 top-0 h-full w-80 max-w-[80vw] bg-base-100 shadow-xl transform transition-transform duration-300 ease-in-out"
          @click.stop
        >
          <div class="flex flex-col h-full">
            <div class="flex items-center justify-between p-4 border-b border-base-300">
              <h3 class="text-lg font-semibold">
                ⚙️ Configuration
              </h3>
              <button
                class="btn btn-ghost btn-sm btn-circle"
                @click="showConfigSidebar = false"
              >
                ✕
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-6">
              <ItemsManager
                :items="items"
                @add-item="addItem"
                @remove-item="removeItem"
                @reset-items="resetItems"
                @reset-config="resetConfig"
              />

              <ConfigPanel
                :config="config"
                :enable-x-limit="enableXLimit"
                :enable-y-limit="enableYLimit"
                @update:config="config = $event"
                @update:enable-x-limit="enableXLimit = $event"
                @update:enable-y-limit="enableYLimit = $event"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
