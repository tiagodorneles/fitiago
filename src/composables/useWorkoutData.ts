import {
  computed,
  ref,
  watch,
} from 'vue'

import { useWorkouts } from '@/api'
import { apiRequest } from '@/api/config'
import type {
  PaginatedResponse,
  Workout,
} from '@/api/types'

export function useWorkoutData(pageSize = 10) {
  // State
  const currentPage = ref(1)
  const allWorkouts = ref<Workout[]>([])
  const isLoadingMore = ref(false)
  const hasMorePages = ref(true)

  // Initial API call for the first page
  const { state, error, isLoading } = useWorkouts({
    page: 1,
    page_size: pageSize,
  })

  // Function to fetch a specific page of workouts
  const fetchWorkoutsPage = async (page: number) => {
    try {
      isLoadingMore.value = true
      const queryString = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      }).toString()

      const data = await apiRequest<PaginatedResponse<Workout>>(`/v1/workouts?${queryString}`)

      if (page === 1) {
        // First page - replace all workouts
        allWorkouts.value = [...(data.workouts || [])]
      } else {
        // Subsequent pages - append new workouts, avoiding duplicates
        const existingIds = new Set(allWorkouts.value.map((w) => w.id))
        const newWorkouts = (data.workouts || []).filter((w: Workout) => !existingIds.has(w.id))
        allWorkouts.value = [...allWorkouts.value, ...newWorkouts]
      }

      // Update pagination state
      hasMorePages.value = (data.page || 1) < (data.page_count || 1)
      isLoadingMore.value = false

      return data
    } catch (err) {
      console.error('Error fetching workouts:', err)
      isLoadingMore.value = false
      throw err
    }
  }

  // Load more workouts
  const loadMore = async () => {
    if (isLoadingMore.value || !hasMorePages.value || isLoading.value) {
      return
    }

    const nextPage = currentPage.value + 1
    console.log('Loading more workouts, page:', nextPage)

    try {
      await fetchWorkoutsPage(nextPage)
      currentPage.value = nextPage
    } catch (error) {
      console.error('Failed to load more workouts:', error)
    }
  }

  // Watch for state changes from the initial API call
  watch(
    [state, error, isLoading],
    ([newState, newError, newIsLoading]) => {
      console.log('Initial API state changed:', {
        state: newState,
        error: newError,
        isLoading: newIsLoading,
        stateStatus: newState?.status,
        stateData: newState?.data,
      })

      // When the initial workouts are loaded, populate our accumulated list
      if (
        newState?.status === 'success' &&
        newState.data?.workouts &&
        allWorkouts.value.length === 0
      ) {
        allWorkouts.value = [...newState.data.workouts]
        hasMorePages.value = (newState.data.page || 1) < (newState.data.page_count || 1)
        currentPage.value = 1
      }
    },
    { immediate: true, deep: true },
  )

  // Helper function to format date for grouping (without time)
  const formatDateOnly = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  // Helper function to get date key for grouping
  const getDateKey = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toDateString() // This gives a consistent key like "Mon Jan 01 2024"
  }

  // Computed property to group workouts by date
  const workoutsByDate = computed(() => {
    if (allWorkouts.value.length === 0) return []

    const grouped = new Map<string, { date: string; dateKey: string; workouts: Workout[] }>()

    allWorkouts.value.forEach((workout: Workout) => {
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

    return sortedGroups
  })

  return {
    // State
    allWorkouts,
    isLoadingMore,
    hasMorePages,
    currentPage,

    // From API
    state,
    error,
    isLoading,

    // Computed
    workoutsByDate,

    // Methods
    loadMore,
    fetchWorkoutsPage,
  }
}
