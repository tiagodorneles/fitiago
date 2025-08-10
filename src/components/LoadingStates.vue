<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span class="ml-3 text-gray-600">Loading workouts...</span>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <span class="text-red-400 text-lg">⚠️</span>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">Error loading workouts</h3>
        <p class="text-sm text-red-700 mt-1">{{ error?.message || 'Unknown error occurred' }}</p>
      </div>
    </div>
  </div>

  <!-- No workouts message -->
  <div v-else-if="!isLoading && workoutsCount === 0 && !isLoadingMore" class="text-center py-12">
    <span class="mx-auto text-gray-400 text-6xl">📋</span>
    <h3 class="mt-2 text-sm font-medium text-gray-900">No workouts found</h3>
    <p class="mt-1 text-sm text-gray-500">Get started by creating your first workout!</p>
  </div>

  <!-- Infinite Scroll Status -->
  <div v-else-if="workoutsCount > 0" class="text-center">
    <!-- Loading more indicator -->
    <div v-if="isLoadingMore" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 text-sm">Loading more workouts...</span>
    </div>

    <!-- End of results indicator -->
    <div v-else-if="!hasMorePages" class="py-4">
      <p class="text-sm text-gray-500">
        You've reached the end! Showing all {{ workoutsCount }} workouts.
      </p>
    </div>
  </div>

  <!-- Debug State (only shown when no other states match) -->
  <div v-else class="bg-gray-100 p-4 rounded-lg mb-4 text-sm">
    <p><strong>Debug Info:</strong></p>
    <p>isLoading: {{ isLoading }}</p>
    <p>isLoadingMore: {{ isLoadingMore }}</p>
    <p>workoutsCount: {{ workoutsCount }}</p>
    <p>hasMorePages: {{ hasMorePages }}</p>
    <p>error: {{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isLoading: boolean
  isLoadingMore: boolean
  error: any
  workoutsCount: number
  hasMorePages: boolean
}

defineProps<Props>()
</script>
