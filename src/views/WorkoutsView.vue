<template>
  <div class="workouts-view max-w-4xl mx-auto p-6">
    <!-- Loading States Component handles all loading/error/empty states -->
    <LoadingStates
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      :error="error"
      :workouts-count="allWorkouts.length"
      :has-more-pages="hasMorePages"
    />

    <!-- Workouts List -->
    <div v-if="allWorkouts.length > 0" class="space-y-6">
      <DateGroup
        v-for="dateGroup in workoutsByDate"
        :key="dateGroup.dateKey"
        :date-group="dateGroup"
        :is-expanded="isDateExpanded(dateGroup.dateKey)"
        :expanded-workouts="expandedWorkouts"
        :expanded-exercises="expandedExercises"
        @toggle="toggleDateExpanded(dateGroup.dateKey)"
        @toggle-workout="toggleWorkoutExpanded"
        @toggle-exercise="toggleExerciseExpanded"
        @view-details="viewWorkout"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

import DateGroup from '@/components/DateGroup.vue'
import LoadingStates from '@/components/LoadingStates.vue'
import { useCollapsibleStates } from '@/composables/useCollapsibleStates'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useWorkoutData } from '@/composables/useWorkoutData'

// Use composables
const { allWorkouts, isLoadingMore, hasMorePages, error, isLoading, workoutsByDate, loadMore } =
  useWorkoutData()

const {
  expandedWorkouts,
  expandedExercises,
  toggleDateExpanded,
  toggleWorkoutExpanded,
  toggleExerciseExpanded,
  isDateExpanded,
  autoExpandDates,
} = useCollapsibleStates()

// Setup infinite scroll
useInfiniteScroll(loadMore)

// Auto-expand dates when workouts are loaded
watch(
  () => allWorkouts.value,
  (workouts) => {
    autoExpandDates(workouts)
  },
  { immediate: true },
)

// Function to view workout details (placeholder)
const viewWorkout = (workoutId: string) => {
  console.log('View workout:', workoutId)
  // TODO: Navigate to workout details page
  alert(`View workout details for ID: ${workoutId}`)
}
</script>
