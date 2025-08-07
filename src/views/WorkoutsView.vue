<template>
  <div class="workouts-view max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Recent Workouts</h1>
      <p class="text-gray-600">Your last 10 workout sessions</p>
    </div>

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

    <!-- Workouts List -->
    <div v-else-if="state.status === 'success' && state.data?.workouts" class="space-y-4">
      <!-- No workouts message -->
      <div v-if="state.data.workouts.length === 0" class="text-center py-12">
        <span class="mx-auto text-gray-400 text-6xl">📋</span>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No workouts found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating your first workout!</p>
      </div>

      <!-- Workouts Grouped by Date -->
      <div v-else class="space-y-6">
        <div
          v-for="dateGroup in workoutsByDate"
          :key="dateGroup.dateKey"
          class="bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <!-- Date Header -->
          <div
            @click="toggleDateExpanded(dateGroup.dateKey)"
            class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <span class="text-blue-600">📅</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ dateGroup.date }}</h3>
                <p class="text-sm text-gray-500">
                  {{ dateGroup.workouts.length }} workout{{
                    dateGroup.workouts.length !== 1 ? 's' : ''
                  }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <i
                class="fas fa-chevron-down w-5 h-5 text-gray-400 transform transition-transform duration-200"
                :class="{ 'rotate-180': isDateExpanded(dateGroup.dateKey) }"
              ></i>
            </div>
          </div>

          <!-- Workouts for this date -->
          <div v-show="isDateExpanded(dateGroup.dateKey)" class="border-t border-gray-200">
            <div class="p-4 space-y-3">
              <div
                v-for="workout in dateGroup.workouts"
                :key="workout.id"
                class="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden"
              >
                <!-- Workout Header -->
                <div
                  @click="toggleWorkoutExpanded(workout.id)"
                  class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100"
                >
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h4 class="text-base font-medium text-gray-900">{{ workout.title }}</h4>
                        <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div class="flex items-center">
                            <span class="mr-1">🕐</span>
                            <span>{{
                              new Date(workout.start_time).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            }}</span>
                          </div>
                          <div class="flex items-center">
                            <span class="mr-1">💪</span>
                            <span
                              >{{ workout.exercises?.length || 0 }} exercise{{
                                (workout.exercises?.length || 0) !== 1 ? 's' : ''
                              }}</span
                            >
                          </div>
                          <div v-if="workout.end_time" class="flex items-center">
                            <span class="mr-1">⏱️</span>
                            <span>{{ getWorkoutDurationMinutes(workout) }}m</span>
                          </div>
                          <div v-if="calculateWorkoutVolume(workout) > 0" class="flex items-center">
                            <span class="mr-1">🏋️</span>
                            <span>{{ Math.round(calculateWorkoutVolume(workout)) }}kg</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center ml-4">
                        <i
                          class="fas fa-chevron-down w-4 h-4 text-gray-400 transform transition-transform duration-200"
                          :class="{ 'rotate-180': isWorkoutExpanded(workout.id) }"
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Workout Details -->
                <div
                  v-show="isWorkoutExpanded(workout.id)"
                  class="px-4 pb-4 border-t border-gray-200 bg-white"
                >
                  <div class="pt-4 space-y-4">
                    <!-- Workout Description -->
                    <div v-if="workout.description">
                      <p class="text-gray-600 text-sm">{{ workout.description }}</p>
                    </div>

                    <!-- Exercise Details -->
                    <div v-if="workout.exercises?.length > 0">
                      <h5 class="text-sm font-medium text-gray-700 mb-3">Exercises:</h5>
                      <div class="space-y-4">
                        <div
                          v-for="exercise in workout.exercises"
                          :key="exercise.id"
                          class="border border-gray-200 rounded-lg p-3 bg-gray-50"
                        >
                          <!-- Exercise Header -->
                          <div class="flex items-center justify-between mb-2">
                            <h6 class="font-medium text-gray-900">{{ exercise.title }}</h6>
                            <div class="flex items-center text-sm text-gray-600">
                              <span class="mr-1 text-xs">🏋️</span>
                              <span v-if="calculateExerciseVolume(exercise) > 0">
                                {{ Math.round(calculateExerciseVolume(exercise)) }}kg
                              </span>
                              <span v-else>No weight</span>
                            </div>
                          </div>

                          <!-- Exercise Sets -->
                          <div v-if="exercise.sets?.length > 0" class="space-y-1">
                            <div
                              v-for="(set, setIndex) in exercise.sets"
                              :key="set.id"
                              class="flex items-center justify-between text-sm text-gray-700 py-1 px-2 bg-white rounded border border-gray-100"
                            >
                              <div class="flex items-center space-x-2">
                                <span class="font-medium text-gray-500 w-8"
                                  >{{ setIndex + 1 }}.</span
                                >
                                <span
                                  v-if="set.set_type !== 'normal'"
                                  class="px-1.5 py-0.5 text-xs rounded bg-gray-200 text-gray-600 uppercase"
                                >
                                  {{ set.set_type }}
                                </span>
                              </div>
                              <div class="flex items-center space-x-3 text-right">
                                <span v-if="set.reps">{{ set.reps }} reps</span>
                                <span v-if="set.weight_kg">{{ set.weight_kg }}kg</span>
                                <span v-if="set.duration_seconds"
                                  >{{ Math.round(set.duration_seconds / 60) }}min</span
                                >
                                <span v-if="set.distance_meters">{{ set.distance_meters }}m</span>
                                <span v-if="set.rpe" class="text-orange-600"
                                  >RPE {{ set.rpe }}</span
                                >
                              </div>
                            </div>
                          </div>

                          <!-- Exercise Notes -->
                          <div v-if="exercise.notes" class="mt-2 text-xs text-gray-600 italic">
                            {{ exercise.notes }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <div class="flex justify-end pt-2">
                      <button
                        @click="viewWorkout(workout.id)"
                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Info -->
      <div class="text-center mt-8 text-sm text-gray-500">
        Showing {{ state.data?.workouts?.length || 0 }} workouts (Page
        {{ state.data?.page || 1 }} of {{ state.data?.page_count || 1 }})
        <span v-if="(state.data?.page || 1) < (state.data?.page_count || 1)" class="ml-2">
          <button @click="loadMore" class="text-blue-600 hover:text-blue-800 font-medium">
            Load more
          </button>
        </span>
      </div>
    </div>

    <!-- Debug State -->
    <div v-else class="bg-gray-100 p-4 rounded-lg mb-4 text-sm">
      <p><strong>Debug Info:</strong></p>
      <p>isLoading: {{ isLoading }}</p>
      <p>error: {{ error }}</p>
      <p>state: {{ state ? JSON.stringify(state) : 'undefined' }}</p>
    </div>

    <!-- Refresh Button -->
    <div class="mt-8 text-center">
      <button
        @click="() => refresh()"
        :disabled="isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i v-if="isLoading" class="fas fa-spinner animate-spin -ml-1 mr-3 h-4 w-4 text-white"></i>
        <span v-else class="mr-2">🔄</span>
        {{ isLoading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'

import { useWorkouts } from '@/api'
import type {
  Workout,
  WorkoutExercise,
} from '@/api/types'

// Reactive pagination parameters
const currentPage = ref(1)
const pageSize = ref(10)

// Fetch workouts using our API
const { state, error, isLoading, refresh } = useWorkouts({
  page: currentPage.value,
  page_size: pageSize.value,
})

// Collapsible state management
const expandedDates = ref(new Set<string>())
const expandedWorkouts = ref(new Set<string>())

// Helper function to format date for grouping (without time)
const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper function to get date key for grouping
const getDateKey = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toDateString() // This gives a consistent key like "Mon Jan 01 2024"
}

// Helper function to calculate exercise volume
const calculateExerciseVolume = (exercise: WorkoutExercise): number => {
  return exercise.sets.reduce((exerciseTotal, set) => {
    // Only calculate volume for sets with weight and reps
    if (set.weight_kg && set.reps) {
      return exerciseTotal + set.weight_kg * set.reps
    }
    return exerciseTotal
  }, 0)
}

// Helper function to calculate workout volume
const calculateWorkoutVolume = (workout: Workout): number => {
  if (!workout.exercises) return 0

  return workout.exercises.reduce((workoutVolume, exercise) => {
    return workoutVolume + calculateExerciseVolume(exercise)
  }, 0)
}

// Helper function to get total workout duration in minutes
const getWorkoutDurationMinutes = (workout: Workout): number | null => {
  if (!workout.end_time) return null
  const start = new Date(workout.start_time)
  const end = new Date(workout.end_time)
  const durationMs = end.getTime() - start.getTime()
  return Math.floor(durationMs / (1000 * 60))
}

// Computed property to group workouts by date
const workoutsByDate = computed(() => {
  if (!state.value?.data?.workouts) return []

  const grouped = new Map<string, { date: string; dateKey: string; workouts: Workout[] }>()

  state.value.data.workouts.forEach((workout: Workout) => {
    const dateKey = getDateKey(workout.start_time)
    const formattedDate = formatDateOnly(workout.start_time)

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        date: formattedDate,
        dateKey,
        workouts: [],
      })
    }

    grouped.get(dateKey)!.workouts.push(workout)
  })

  // Convert to array and sort by date (newest first)
  const sortedGroups = Array.from(grouped.values()).sort((a, b) => {
    return new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime()
  })

  // Sort workouts within each date group by start time (earliest to latest)
  sortedGroups.forEach((group) => {
    group.workouts.sort((a, b) => {
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })
  })

  // Auto-expand the first few dates (most recent)
  sortedGroups.slice(0, 3).forEach((group) => {
    if (!expandedDates.value.has(group.dateKey)) {
      expandedDates.value.add(group.dateKey)
    }
  })

  return sortedGroups
})

// Functions to manage collapsible state
const toggleDateExpanded = (dateKey: string) => {
  if (expandedDates.value.has(dateKey)) {
    expandedDates.value.delete(dateKey)
  } else {
    expandedDates.value.add(dateKey)
  }
}

const toggleWorkoutExpanded = (workoutId: string) => {
  if (expandedWorkouts.value.has(workoutId)) {
    expandedWorkouts.value.delete(workoutId)
  } else {
    expandedWorkouts.value.add(workoutId)
  }
}

const isDateExpanded = (dateKey: string) => expandedDates.value.has(dateKey)
const isWorkoutExpanded = (workoutId: string) => expandedWorkouts.value.has(workoutId)

// Debug logging
console.log('Workouts component state:', {
  state,
  error,
  isLoading,
})

// Watch for state changes
watch(
  [state, error, isLoading],
  ([newState, newError, newIsLoading]) => {
    console.log('State changed:', {
      state: newState,
      error: newError,
      isLoading: newIsLoading,
      stateStatus: newState?.status,
      stateData: newState?.data,
    })
  },
  { immediate: true, deep: true },
)

// Function to view workout details (placeholder)
const viewWorkout = (workoutId: string) => {
  console.log('View workout:', workoutId)
  // TODO: Navigate to workout details page
  alert(`View workout details for ID: ${workoutId}`)
}

// Function to load more workouts
const loadMore = () => {
  currentPage.value += 1
  // TODO: Implement pagination with more sophisticated state management
  console.log('Load more workouts, page:', currentPage.value)
}
</script>
