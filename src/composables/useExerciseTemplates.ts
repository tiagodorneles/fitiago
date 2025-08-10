import {
  computed,
  type ComputedRef,
  ref,
  type Ref,
  watch,
} from 'vue'

import type {
  ExerciseTemplate,
  Workout,
} from '@/api/types'
import { useExerciseTemplateStore } from '@/stores/exerciseTemplates'

/**
 * Composable to manage exercise templates for workouts
 * Automatically fetches missing templates and provides reactive access
 */
export function useExerciseTemplates(workouts: Ref<Workout[]> | ComputedRef<Workout[]>) {
  const templateStore = useExerciseTemplateStore()
  const isLoadingTemplates = ref(false)

  /**
   * Get all unique exercise template IDs from workouts
   */
  const getTemplateIds = (workoutList: Workout[]): string[] => {
    const ids = new Set<string>()
    workoutList.forEach((workout) => {
      workout.exercises?.forEach((exercise) => {
        if (exercise.exercise_template_id) {
          ids.add(exercise.exercise_template_id)
        }
      })
    })
    return Array.from(ids)
  }

  /**
   * Fetch missing exercise templates for the current workouts
   */
  const fetchMissingTemplates = async (workoutList: Workout[]) => {
    const templateIds = getTemplateIds(workoutList)
    const missingIds = templateIds.filter(
      (id) => !templateStore.getTemplate(id) && !templateStore.isLoading(id),
    )

    if (missingIds.length === 0) return

    console.log(`Fetching ${missingIds.length} missing exercise templates:`, missingIds)
    isLoadingTemplates.value = true

    try {
      await templateStore.fetchTemplates(missingIds)
    } catch (error) {
      console.error('Failed to fetch exercise templates:', error)
    } finally {
      isLoadingTemplates.value = false
    }
  }

  /**
   * Get exercise template by ID with reactive updates
   */
  const getTemplate = (id: string): ExerciseTemplate | undefined => {
    return templateStore.getTemplate(id)
  }

  /**
   * Get muscle groups for an exercise template ID
   */
  const getMuscleGroups = (templateId: string) => {
    const template = templateStore.getTemplate(templateId)
    return {
      primary: template?.primary_muscle_group,
      secondary: template?.secondary_muscle_groups || [],
    }
  }

  /**
   * Check if any templates are currently loading
   */
  const hasLoadingTemplates = computed(() => {
    return isLoadingTemplates.value || templateStore.loading.size > 0
  })

  /**
   * Get all templates currently in the store
   */
  const allTemplates = computed(() => templateStore.getAllTemplates())

  // Watch workouts and fetch missing templates
  watch(
    workouts,
    (newWorkouts) => {
      if (newWorkouts && newWorkouts.length > 0) {
        fetchMissingTemplates(newWorkouts)
      }
    },
    { immediate: true },
  )

  return {
    // State
    isLoadingTemplates: hasLoadingTemplates,
    allTemplates,

    // Methods
    getTemplate,
    getMuscleGroups,
    fetchMissingTemplates,

    // Store access
    templateStore,
  }
}
