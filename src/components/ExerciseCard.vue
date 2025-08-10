<template>
  <div class="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden relative">
    <!-- Exercise Header -->
    <div
      @click="toggleExpanded"
      class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <!-- Superset indicator dot -->
          <h6 class="text-sm sm:text-base font-medium text-gray-900 truncate">
            {{ exercise.title }}
          </h6>
        </div>

        <!-- Exercise info: volume and muscle groups -->
        <div class="flex items-center gap-1 text-xs text-gray-500 mt-1 flex-wrap">
          <!-- Total volume badge (always visible) -->
          <span
            v-if="volume > 0"
            class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10"
          >
            🏋️ {{ Math.round(volume) }}kg
          </span>

          <!-- Muscle groups (if template available) -->
          <template v-if="exerciseTemplate">
            <!-- Primary muscle group -->
            <span
              v-if="exerciseTemplate.primary_muscle_group"
              class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
            >
              {{ formatMuscleGroup(exerciseTemplate.primary_muscle_group) }}
            </span>

            <!-- Visible secondary muscle groups -->
            <span
              v-for="secondary in visibleSecondaryMuscles"
              :key="secondary"
              class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
            >
              {{ formatMuscleGroup(secondary) }}
            </span>

            <!-- Show more button for hidden secondary muscles -->
            <button
              v-if="hiddenSecondaryCount > 0 && !showAllMuscleGroups"
              @click="toggleMuscleGroups"
              class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/10 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              +{{ hiddenSecondaryCount }}
            </button>
          </template>
        </div>
        <!-- Summary badges when collapsed -->
        <div v-if="!isExpanded" class="flex items-center gap-2 mt-2">
          <!-- Sets badge -->
          <span
            class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10"
          >
            {{ setsCount }} sets
          </span>
          <!-- Reps range badge -->
          <span
            v-if="repRange"
            class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 inset-ring inset-ring-yellow-600/20"
          >
            {{
              repRange.min === repRange.max
                ? `${repRange.min} reps`
                : `${repRange.min}-${repRange.max} reps`
            }}
          </span>
          <!-- Weight range badge -->
          <span
            v-if="weightRange"
            class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 inset-ring inset-ring-indigo-700/1"
          >
            {{
              weightRange.min === weightRange.max
                ? `${weightRange.min}kg`
                : `${weightRange.min}-${weightRange.max}kg`
            }}
          </span>
        </div>
      </div>
      <div class="flex items-center ml-3 space-x-2">
        <!-- Chevron icon -->
        <i
          class="fas fa-chevron-down w-4 h-4 text-gray-400 transform transition-transform duration-200"
          :class="{
            'rotate-180': isExpanded,
          }"
        ></i>
      </div>
    </div>

    <!-- Exercise Details (when expanded) -->
    <div v-show="isExpanded" class="px-3 pb-3 border-t border-gray-200 bg-white">
      <!-- Exercise Sets -->
      <div v-if="exercise.sets?.length > 0" class="space-y-1 pt-3">
        <div
          v-for="(set, setIndex) in exercise.sets"
          :key="set.id"
          class="flex items-center text-xs sm:text-sm text-gray-700 py-1 px-2"
        >
          <div class="flex items-center space-x-2 w-8">
            <span
              class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10"
            >
              {{ setIndex + 1 }}
            </span>
          </div>
          <div class="flex items-center space-x-1 sm:space-x-2">
            <span
              class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 inset-ring inset-ring-yellow-600/20"
              v-if="set.reps"
            >
              {{ set.reps }} reps
            </span>
            <i v-if="set.weight_kg" class="fa fa-times text-[8px] mr-2 text-gray-400" />

            <span
              class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 inset-ring inset-ring-indigo-700/1"
              v-if="set.weight_kg"
            >
              {{ set.weight_kg }}kg
            </span>
            <span v-if="set.duration_seconds">
              {{ Math.round(set.duration_seconds / 60) }}min
            </span>
            <span v-if="set.distance_meters">{{ set.distance_meters }}m</span>
            <span v-if="set.rpe" class="text-orange-600">RPE {{ set.rpe }}</span>
          </div>
        </div>
      </div>

      <!-- Exercise Notes -->
      <div v-if="exercise.notes" class="mt-3 text-[10px] sm:text-xs text-gray-600 italic">
        {{ exercise.notes }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'

import type {
  ExerciseTemplate,
  WorkoutExercise,
} from '@/api/types'

interface Props {
  exercise: WorkoutExercise
  exerciseTemplate?: ExerciseTemplate
  isExpanded: boolean
  supersetColor?: string
}

interface Emits {
  (e: 'toggle'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State for muscle group expansion
const showAllMuscleGroups = ref(false)

// Computed properties for muscle group display
const visibleSecondaryMuscles = computed(() => {
  if (!props.exerciseTemplate?.secondary_muscle_groups) return []

  if (showAllMuscleGroups.value) {
    return props.exerciseTemplate.secondary_muscle_groups
  }

  // Show only the first secondary muscle group
  return props.exerciseTemplate.secondary_muscle_groups.slice(0, 1)
})

const hiddenSecondaryCount = computed(() => {
  if (!props.exerciseTemplate?.secondary_muscle_groups) return 0
  return Math.max(0, props.exerciseTemplate.secondary_muscle_groups.length - 1)
})

const toggleMuscleGroups = (event: Event) => {
  event.stopPropagation() // Prevent exercise card toggle
  showAllMuscleGroups.value = !showAllMuscleGroups.value
}

// Helper function to format muscle group names
const formatMuscleGroup = (muscleGroup: string): string => {
  return muscleGroup.replace(/_/g, ' ')
}

// Helper function to calculate exercise volume
const volume = computed(() => {
  return props.exercise.sets.reduce((exerciseTotal, set) => {
    // Only calculate volume for sets with weight and reps
    if (set.weight_kg && set.reps) {
      return exerciseTotal + set.weight_kg * set.reps
    }
    return exerciseTotal
  }, 0)
})

// Helper function to get exercise sets count
const setsCount = computed(() => {
  return props.exercise.sets.length
})

// Helper function to get exercise rep range
const repRange = computed(() => {
  const reps = props.exercise.sets.filter((set) => set.reps && set.reps > 0).map((set) => set.reps!)

  if (reps.length === 0) return null

  return {
    min: Math.min(...reps),
    max: Math.max(...reps),
  }
})

// Helper function to get exercise weight range
const weightRange = computed(() => {
  const weights = props.exercise.sets
    .filter((set) => set.weight_kg && set.weight_kg > 0)
    .map((set) => set.weight_kg!)

  if (weights.length === 0) return null

  return {
    min: Math.min(...weights),
    max: Math.max(...weights),
  }
})

const toggleExpanded = () => {
  emit('toggle')
}
</script>
