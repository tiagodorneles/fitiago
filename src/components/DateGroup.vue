<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
    <!-- Date Header -->
    <div
      @click="toggleExpanded"
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
    >
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <span class="text-blue-600">📅</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ dateGroup.date }}</h3>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm text-gray-500 border rounded-2xl border-gray-300 py-1 px-2">
              💪 {{ dateGroup.workouts.length }}
            </span>
            <span
              v-if="totalVolume > 0"
              class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl py-1 px-2"
            >
              🏋️ {{ Math.round(totalVolume) }}kg
            </span>
            <span
              v-if="totalDuration > 0"
              class="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-2xl py-1 px-2"
            >
              ⏱️ {{ totalDuration }}min
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <i
          class="fas fa-chevron-down w-5 h-5 text-gray-400 transform transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
        ></i>
      </div>
    </div>

    <!-- Workouts for this date -->
    <div v-show="isExpanded" class="border-t border-gray-200">
      <div class="p-4 space-y-3">
        <WorkoutCard
          v-for="workout in dateGroup.workouts"
          :key="workout.id"
          :workout="workout"
          :is-expanded="isWorkoutExpanded(workout.id)"
          :expanded-exercises="expandedExercises"
          @toggle="toggleWorkout(workout.id)"
          @toggle-exercise="toggleExercise"
          @view-details="$emit('view-details', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Workout } from '@/api/types'

import WorkoutCard from './WorkoutCard.vue'

interface DateGroupData {
  date: string
  dateKey: string
  workouts: Workout[]
}

interface Props {
  dateGroup: DateGroupData
  isExpanded: boolean
  expandedWorkouts: Set<string>
  expandedExercises: Record<string, boolean>
}

interface Emits {
  (e: 'toggle'): void
  (e: 'toggle-workout', workoutId: string): void
  (e: 'toggle-exercise', exerciseKey: string): void
  (e: 'view-details', workoutId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Calculate total volume for all workouts on this date
const totalVolume = computed(() => {
  return props.dateGroup.workouts.reduce((dateTotal, workout) => {
    const workoutVolume =
      workout.exercises?.reduce((workoutTotal, exercise) => {
        const exerciseVolume = exercise.sets.reduce((exerciseTotal, set) => {
          // Only calculate volume for sets with weight and reps
          if (set.weight_kg && set.reps) {
            return exerciseTotal + set.weight_kg * set.reps
          }
          return exerciseTotal
        }, 0)
        return workoutTotal + exerciseVolume
      }, 0) || 0
    return dateTotal + workoutVolume
  }, 0)
})

// Calculate total duration for all workouts on this date
const totalDuration = computed(() => {
  return props.dateGroup.workouts.reduce((total, workout) => {
    if (workout.start_time && workout.end_time) {
      const start = new Date(workout.start_time)
      const end = new Date(workout.end_time)
      const durationMs = end.getTime() - start.getTime()
      const durationMinutes = Math.floor(durationMs / (1000 * 60))
      return total + durationMinutes
    }
    return total
  }, 0)
})

const toggleExpanded = () => {
  emit('toggle')
}

const isWorkoutExpanded = (workoutId: string) => {
  return props.expandedWorkouts.has(workoutId)
}

const toggleWorkout = (workoutId: string) => {
  emit('toggle-workout', workoutId)
}

const toggleExercise = (exerciseKey: string) => {
  emit('toggle-exercise', exerciseKey)
}
</script>
