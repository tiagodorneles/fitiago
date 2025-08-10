<template>
  <div class="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
    <!-- Workout Header -->
    <div
      @click="toggleExpanded"
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100"
    >
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-gray-900 truncate">
          {{ workout.title }}
        </h4>
      </div>
      <div class="flex items-center gap-x-2 sm:gap-x-3 text-xs text-gray-500 ml-3">
        <div v-if="workout.end_time" class="flex items-center">
          <span class="mr-1 text-sm">⏱️</span>
          <span>{{ durationMinutes }}m</span>
        </div>
        <div v-if="totalVolume > 0" class="flex items-center">
          <span class="mr-1 text-sm">🏋️</span>
          <span>{{ Math.round(totalVolume) }}kg</span>
        </div>
      </div>
      <div class="flex items-center ml-3">
        <i
          class="fas fa-chevron-down w-4 h-4 text-gray-400 transform transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
        ></i>
      </div>
    </div>

    <!-- Workout Details -->
    <div v-show="isExpanded" class="px-4 pb-4 border-t border-gray-200 bg-white">
      <div class="pt-4 space-y-4">
        <!-- Workout Description -->
        <div v-if="workout.description">
          <p class="text-gray-600 text-sm">{{ workout.description }}</p>
        </div>

        <!-- Workout Details Card -->
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600">
            <div class="flex items-center">
              <span class="mr-1 text-sm">🕐</span>
              <span class="ml-1">{{ startTime }}</span>
              <span v-if="endTime" class="ml-1">to {{ endTime }}</span>
            </div>
            <div class="flex items-center">
              <span class="mr-1 text-sm">💪</span>
              <span class="font-medium">Exercises:</span>
              <span class="ml-1">{{ workout.exercises?.length || 0 }}</span>
            </div>
            <div v-if="supersetCount > 0" class="flex items-center">
              <span class="mr-1 text-sm">🔀</span>
              <span class="font-medium">Supersets:</span>
              <span class="ml-1">{{ supersetCount }}</span>
            </div>
            <div v-if="isLoadingTemplates" class="flex items-center">
              <span class="mr-1 text-sm">🔄</span>
              <span class="font-medium text-blue-600">Loading muscle groups...</span>
            </div>
          </div>
        </div>

        <!-- Exercise Details -->
        <div v-if="workout.exercises?.length > 0">
          <div class="space-y-4">
            <!-- Render superset groups -->
            <div v-for="group in exerciseGroups" :key="group.key" class="space-y-2">
              <!-- Superset label for grouped exercises -->
              <div v-if="group.isSupersetGroup" class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: group.color }"></div>
                <span class="text-sm font-medium text-gray-700">
                  Superset {{ group.supersetLabel }}
                </span>
              </div>

              <!-- Exercise cards with superset styling -->
              <div
                class="space-y-2"
                :class="group.isSupersetGroup ? 'pl-4' : ''"
                :style="group.isSupersetGroup ? { borderLeft: `4px solid ${group.color}` } : {}"
              >
                <ExerciseCard
                  v-for="exercise in group.exercises"
                  :key="exercise.id"
                  :exercise="exercise"
                  :exercise-template="getTemplate(exercise.exercise_template_id)"
                  :is-expanded="isExerciseExpanded(exercise.exercise_template_id)"
                  :superset-color="group.isSupersetGroup ? group.color : undefined"
                  @toggle="toggleExercise(exercise.exercise_template_id)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type {
  Workout,
  WorkoutExercise,
} from '@/api/types'
import { useExerciseTemplates } from '@/composables/useExerciseTemplates'

import ExerciseCard from './ExerciseCard.vue'

interface Props {
  workout: Workout
  isExpanded: boolean
  expandedExercises: Record<string, boolean>
}

interface Emits {
  (e: 'toggle'): void
  (e: 'toggle-exercise', exerciseId: string): void
  (e: 'view-details', workoutId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Exercise templates composable
const { getTemplate, isLoadingTemplates } = useExerciseTemplates(computed(() => [props.workout]))

// Predefined colors for superset groups
const supersetColors = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
]

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
const totalVolume = computed(() => {
  if (!props.workout.exercises) return 0

  return props.workout.exercises.reduce((workoutVolume, exercise) => {
    return workoutVolume + calculateExerciseVolume(exercise)
  }, 0)
})

// Helper function to get total workout duration in minutes
const durationMinutes = computed(() => {
  if (!props.workout.end_time) return null
  const start = new Date(props.workout.start_time)
  const end = new Date(props.workout.end_time)
  const durationMs = end.getTime() - start.getTime()
  return Math.floor(durationMs / (1000 * 60))
})

// Format start time
const startTime = computed(() => {
  return new Date(props.workout.start_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Format end time
const endTime = computed(() => {
  if (!props.workout.end_time) return null
  return new Date(props.workout.end_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Count unique supersets in the workout
const supersetCount = computed(() => {
  if (!props.workout.exercises) return 0

  const uniqueSupersetIds = new Set<string>()
  props.workout.exercises.forEach((exercise) => {
    if (exercise.superset_id !== null && exercise.superset_id !== undefined) {
      uniqueSupersetIds.add(String(exercise.superset_id))
    }
  })

  return uniqueSupersetIds.size
})

// Group exercises by superset
const exerciseGroups = computed(() => {
  if (!props.workout.exercises) return []

  // First, identify unique superset IDs (include 0 as valid superset_id)
  const supersetIds = Array.from(
    new Set(
      props.workout.exercises
        .filter((ex) => ex.superset_id !== null && ex.superset_id !== undefined)
        .map((ex) => ex.superset_id),
    ),
  )

  // Create a color mapping for superset IDs
  const colorMap = new Map<string, { color: string; label: string }>()
  supersetIds.forEach((id, index) => {
    if (id !== null && id !== undefined) {
      colorMap.set(String(id), {
        color: supersetColors[index % supersetColors.length],
        label: String.fromCharCode(65 + index), // A, B, C, etc.
      })
    }
  })

  // Group exercises maintaining original order
  const groups: Array<{
    key: string
    exercises: WorkoutExercise[]
    isSupersetGroup: boolean
    color?: string
    supersetLabel?: string
  }> = []

  // Track processed exercises to avoid duplicates
  const processedExercises = new Set<string>()

  // Process exercises in their original order to maintain sequence
  for (const exercise of props.workout.exercises) {
    if (processedExercises.has(exercise.exercise_template_id)) continue

    if (exercise.superset_id !== null && exercise.superset_id !== undefined) {
      // This is a superset exercise - check if we've already created a group for this superset
      const existingGroupIndex = groups.findIndex(
        (g) => g.isSupersetGroup && g.key === `superset-${exercise.superset_id}`,
      )

      if (existingGroupIndex === -1) {
        // Create new superset group - get all exercises with this superset_id
        const allSupersetExercises = props.workout.exercises.filter(
          (ex) => ex.superset_id === exercise.superset_id,
        )

        if (allSupersetExercises.length > 0) {
          const colorInfo = colorMap.get(String(exercise.superset_id))!
          groups.push({
            key: `superset-${exercise.superset_id}`,
            exercises: allSupersetExercises,
            isSupersetGroup: true,
            color: colorInfo.color,
            supersetLabel: colorInfo.label,
          })

          // Mark these exercises as processed
          allSupersetExercises.forEach((ex) => processedExercises.add(ex.exercise_template_id))
        }
      }
    } else {
      // Individual exercise (superset_id is null or undefined)
      groups.push({
        key: `individual-${exercise.exercise_template_id}`,
        exercises: [exercise],
        isSupersetGroup: false,
      })
      processedExercises.add(exercise.exercise_template_id)
    }
  }

  return groups
})

const toggleExpanded = () => {
  emit('toggle')
}

const isExerciseExpanded = (exerciseId: string) => {
  const key = `${props.workout.id}-${exerciseId}`
  return !!props.expandedExercises[key]
}

const toggleExercise = (exerciseId: string) => {
  const key = `${props.workout.id}-${exerciseId}`
  emit('toggle-exercise', key)
}
</script>
