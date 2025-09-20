<script lang="ts" setup>
export interface ConfigPanelProps {
  loop: boolean
  renderLimit: number
  stack: number
  stackOffset: number
  stackScale: number
  stackDirection: 'top' | 'bottom' | 'left' | 'right'
  swipeDirection: 'horizontal' | 'vertical'
  swipeThreshold: number
  dragThreshold: number
  maxRotation: number
  maxDragX: number | null
  maxDragY: number | null
  disableDrag: boolean
  waitAnimationEnd: boolean
}

interface Props {
  config: ConfigPanelProps
  enableXLimit: boolean
  enableYLimit: boolean
}

interface Emits {
  (e: 'update:config', value: ConfigPanelProps): void
  (e: 'update:enableXLimit', value: boolean): void
  (e: 'update:enableYLimit', value: boolean): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <h2 class="card-title text-lg mb-4">
        ⚙️ Configuration
      </h2>

      <!-- FlashCards Props -->
      <div class="space-y-4">
        <!-- Loop -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Loop</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Enable endless card swiping
          </div>
          <label class="cursor-pointer">
            <input
              :checked="config.loop"
              type="checkbox"
              class="checkbox checkbox-primary"
              @change="$emit('update:config', { ...config, loop: ($event.target as HTMLInputElement).checked })"
            >
          </label>
        </div>

        <!-- Render Limit -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Render Limit</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Number of cards rendered in DOM
          </div>
          <input
            :value="config.renderLimit"
            type="range"
            min="1"
            max="10"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, renderLimit: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>1</span>
            <span class="opacity-50">
              {{ config.renderLimit }}
            </span>
            <span>10</span>
          </div>
        </div>

        <!-- Stack -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Stack</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Number of cards to show stacked behind the active card
          </div>
          <input
            :value="config.stack"
            type="range"
            min="0"
            max="10"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, stack: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>0</span>
            <span class="opacity-50">
              {{ config.stack }}
            </span>
            <span>10</span>
          </div>
        </div>

        <!-- Stack Offset -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Stack Offset</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Spacing between stacked cards
          </div>
          <input
            :value="config.stackOffset"
            type="range"
            min="0"
            max="50"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, stackOffset: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>0</span>
            <span class="opacity-50">
              {{ config.stackOffset }}
            </span>
            <span>50</span>
          </div>
        </div>

        <!-- Stack Scale -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Stack Scale</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Scale reduction for each card
          </div>
          <input
            :value="config.stackScale"
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, stackScale: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>0</span>
            <span class="opacity-50">
              {{ config.stackScale.toFixed(2) }}
            </span>
            <span>0.2</span>
          </div>
        </div>

        <!-- Stack Direction -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Stack Direction</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Direction where cards stack
          </div>
          <select
            :value="config.stackDirection"
            class="select select-primary select-sm"
            @change="$emit('update:config', { ...config, stackDirection: ($event.target as HTMLSelectElement).value as any })"
          >
            <option value="top">
              Top
            </option>
            <option value="bottom">
              Bottom
            </option>
            <option value="left">
              Left
            </option>
            <option value="right">
              Right
            </option>
          </select>
        </div>

        <!-- Swipe Direction -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Swipe Direction</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Direction of swipe interactions (affects animations)
          </div>
          <div class="flex items-center space-x-4">
            <label class="cursor-pointer flex items-center space-x-2">
              <input
                :checked="config.swipeDirection === 'horizontal'"
                type="radio"
                name="swipeDirection"
                value="horizontal"
                class="radio radio-primary radio-sm"
                @change="$emit('update:config', { ...config, swipeDirection: 'horizontal' })"
              >
              <span class="text-sm">Horizontal</span>
            </label>
            <label class="cursor-pointer flex items-center space-x-2">
              <input
                :checked="config.swipeDirection === 'vertical'"
                type="radio"
                name="swipeDirection"
                value="vertical"
                class="radio radio-primary radio-sm"
                @change="$emit('update:config', { ...config, swipeDirection: 'vertical' })"
              >
              <span class="text-sm">Vertical</span>
            </label>
          </div>
        </div>

        <!-- Swipe Threshold -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Swipe Threshold</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Distance to swipe for completion
          </div>
          <input
            :value="config.swipeThreshold"
            type="range"
            min="50"
            max="300"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, swipeThreshold: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>50</span>
            <span class="opacity-50">
              {{ config.swipeThreshold }}px
            </span>
            <span>300</span>
          </div>
        </div>

        <!-- Drag Threshold -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Drag Threshold</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Distance to start dragging
          </div>
          <input
            :value="config.dragThreshold"
            type="range"
            min="5"
            max="50"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, dragThreshold: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>5</span>
            <span class="opacity-50">
              {{ config.dragThreshold }}px
            </span>
            <span>50</span>
          </div>
        </div>

        <!-- Max Rotation -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Max Rotation</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Maximum card rotation degrees
          </div>
          <input
            :value="config.maxRotation"
            type="range"
            min="0"
            max="45"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, maxRotation: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>0</span>
            <span class="opacity-50">
              {{ config.maxRotation }}°
            </span>
            <span>45</span>
          </div>
        </div>

        <!-- Drag Limits -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Enable X Limit</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Limit horizontal dragging
          </div>
          <label class="cursor-pointer">
            <input
              :checked="enableXLimit"
              type="checkbox"
              class="checkbox checkbox-primary"
              @change="$emit('update:enableXLimit', ($event.target as HTMLInputElement).checked)"
            >
          </label>
        </div>

        <div v-if="enableXLimit" class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Max Dragging X</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Maximum horizontal distance
          </div>
          <input
            :value="config.maxDragX"
            type="range"
            min="50"
            max="500"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, maxDragX: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>50</span>
            <span class="opacity-50">
              {{ config.maxDragX }}px
            </span>
            <span>500</span>
          </div>
        </div>

        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Enable Y Limit</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Limit vertical dragging
          </div>
          <label class="cursor-pointer">
            <input
              :checked="enableYLimit"
              type="checkbox"
              class="checkbox checkbox-primary"
              @change="$emit('update:enableYLimit', ($event.target as HTMLInputElement).checked)"
            >
          </label>
        </div>

        <div v-if="enableYLimit" class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Max Dragging Y</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Maximum vertical distance
          </div>
          <input
            :value="config.maxDragY"
            type="range"
            min="0"
            max="200"
            class="range range-primary range-sm w-full"
            @input="$emit('update:config', { ...config, maxDragY: Number(($event.target as HTMLInputElement).value) })"
          >
          <div class="w-full flex justify-between text-xs px-2">
            <span>0</span>
            <span class="opacity-50">
              {{ config.maxDragY }}px
            </span>
            <span>200</span>
          </div>
        </div>

        <!-- Disable Drag -->
        <div class="form-control">
          <div class="mb-1">
            <span class="label-text font-medium">Disable Drag</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Turn off all dragging interactions
          </div>
          <label class="cursor-pointer">
            <input
              :checked="config.disableDrag"
              type="checkbox"
              class="checkbox checkbox-primary"
              @change="$emit('update:config', { ...config, disableDrag: ($event.target as HTMLInputElement).checked })"
            >
          </label>
        </div>

        <div>
          <div class="mb-1">
            <span class="label-text font-medium">Wait for Animation</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            Wait for animation to end before performing next action
          </div>
          <!-- Wait Animation End -->
          <label class="cursor-pointer">
            <input
              :checked="config.waitAnimationEnd"
              type="checkbox"
              class="checkbox checkbox-primary"
              @change="$emit('update:config', { ...config, waitAnimationEnd: ($event.target as HTMLInputElement).checked })"
            >
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
