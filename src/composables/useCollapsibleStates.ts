import { ref } from 'vue'

import type { Workout } from '@/api/types'

export function useCollapsibleStates() {
  // Collapsible state management
  const expandedDates = ref(new Set<string>())
  const expandedWorkouts = ref(new Set<string>())
  const expandedExercises = ref<Record<string, boolean>>({})

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

  const toggleExerciseExpanded = (exerciseId: string) => {
    expandedExercises.value[exerciseId] = !expandedExercises.value[exerciseId]
  }

  const isDateExpanded = (dateKey: string) => expandedDates.value.has(dateKey)
  const isWorkoutExpanded = (workoutId: string) => expandedWorkouts.value.has(workoutId)
  const isExerciseExpanded = (exerciseId: string) => !!expandedExercises.value[exerciseId]

  // Auto-expand functionality
  const hasAutoExpanded = ref(false)

  const autoExpandDates = (workouts: Workout[]) => {
    if (workouts && workouts.length > 0 && !hasAutoExpanded.value) {
      // Helper function to get date key for grouping
      const getDateKey = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toDateString()
      }

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

      // Get the sorted groups to find the most recent dates
      const grouped = new Map<string, { date: string; dateKey: string; workouts: Workout[] }>()

      workouts.forEach((workout: Workout) => {
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

      // Auto-expand the first few dates (most recent)
      sortedGroups.slice(0, 3).forEach((group) => {
        expandedDates.value.add(group.dateKey)
      })

      hasAutoExpanded.value = true
    }
  }

  return {
    // State
    expandedDates,
    expandedWorkouts,
    expandedExercises,
    hasAutoExpanded,

    // Methods
    toggleDateExpanded,
    toggleWorkoutExpanded,
    toggleExerciseExpanded,
    isDateExpanded,
    isWorkoutExpanded,
    isExerciseExpanded,
    autoExpandDates,
  }
}
