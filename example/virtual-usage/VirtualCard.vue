<script setup lang="ts">
interface VirtualItem {
  id: number
  text: string
}

defineProps<{
  item: VirtualItem
  approved: number
  rejected: number
  remaining: number
  progress: number
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl shadow-xl h-80 bg-gradient-to-br from-slate-800 to-slate-900 text-white select-none transform transition-all duration-300 hover:shadow-2xl">
    <!-- Header with number -->
    <div class="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-cyan-500 to-blue-500">
      <div class="absolute inset-0 bg-black/10" />
      <div class="absolute top-3 left-4 text-white font-bold text-lg">
        #{{ item.id }}
      </div>
      <div class="absolute top-3 right-4 text-white/80 text-sm">
        Virtual Demo
      </div>
    </div>

    <!-- Main content -->
    <div class="pt-20 p-6 h-full flex flex-col justify-center">
      <div class="card-text text-center mb-8">
        <h2 class="text-xl font-bold mb-2">
          {{ item.text }}
        </h2>
        <div class="text-cyan-400 text-sm">
          Performance test with 1000 cards
        </div>
      </div>

      <!-- Stats grid -->
      <div class="card-stats grid grid-cols-3 gap-3 text-center mb-4">
        <div class="bg-emerald-500/20 rounded-lg p-3">
          <div class="text-emerald-400 text-2xl font-bold">
            {{ approved }}
          </div>
          <div class="text-emerald-300 text-xs">
            Approved
          </div>
        </div>
        <div class="bg-red-500/20 rounded-lg p-3">
          <div class="text-red-400 text-2xl font-bold">
            {{ rejected }}
          </div>
          <div class="text-red-300 text-xs">
            Rejected
          </div>
        </div>
        <div class="bg-blue-500/20 rounded-lg p-3">
          <div class="text-blue-400 text-2xl font-bold">
            {{ remaining }}
          </div>
          <div class="text-blue-300 text-xs">
            Remaining
          </div>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-700">
      <div
        class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
