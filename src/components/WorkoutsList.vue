<template>
  <div class="workouts-list">
    <h2 class="text-2xl font-bold mb-4">My Workouts</h2>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-4">
      <p>Loading workouts...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-red-500 py-4">
      <p>Error loading workouts: {{ error.message }}</p>
    </div>

    <!-- Workouts list -->
    <div v-else-if="data" class="space-y-4">
      <div
        v-for="workout in data.data"
        :key="workout.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <h3 class="text-lg font-semibold">{{ workout.title }}</h3>
        <p v-if="workout.description" class="text-gray-600 mt-1">{{ workout.description }}</p>
        <div class="mt-2 text-sm text-gray-500">
          <p>Started: {{ new Date(workout.start_time).toLocaleDateString() }}</p>
          <p>Exercises: {{ workout.exercises.length }}</p>
        </div>
      </div>

      <!-- Pagination info -->
      <div class="text-center text-sm text-gray-500 mt-6">
        Page {{ data.page }} of {{ Math.ceil(data.total_count / data.page_size) }} ({{
          data.total_count
        }}
        total workouts)
      </div>
    </div>

    <!-- Create workout button -->
    <button
      @click="createSampleWorkout"
      :disabled="createMutation.isPending.value"
      class="mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
    >
      {{ createMutation.isPending.value ? 'Creating...' : 'Create Sample Workout' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  useCreateWorkout,
  useWorkouts,
} from '@/api'

// Fetch workouts with pagination
const { data, error, isLoading } = useWorkouts({ page: 1, page_size: 10 })

// Create workout mutation
const createMutation = useCreateWorkout()

// Function to create a sample workout
const createSampleWorkout = async () => {
  try {
    await createMutation.mutateAsync({
      title: 'Sample Workout',
      description: 'A sample workout created from the app',
      start_time: new Date().toISOString(),
      exercises: [
        {
          exercise_template_id: 'sample-exercise-id',
          title: 'Push-ups',
          sets: [
            {
              index: 0,
              set_type: 'normal',
              reps: 10,
            },
          ],
        },
      ],
    })
    console.log('Workout created successfully!')
  } catch (err) {
    console.error('Failed to create workout:', err)
  }
}
</script>
