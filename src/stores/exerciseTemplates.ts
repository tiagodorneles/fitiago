import { ref } from 'vue'

import { defineStore } from 'pinia'

import { apiRequest } from '@/api/config'
import type { ExerciseTemplate } from '@/api/types'

export const useExerciseTemplateStore = defineStore('exerciseTemplates', () => {
  // Store exercise templates by ID for fast lookup
  const templates = ref<Map<string, ExerciseTemplate>>(new Map())

  // Track loading states for individual templates
  const loading = ref<Set<string>>(new Set())

  // Track errors for individual templates
  const errors = ref<Map<string, string>>(new Map())

  /**
   * Get an exercise template by ID from the store
   */
  const getTemplate = (id: string): ExerciseTemplate | undefined => {
    return templates.value.get(id)
  }

  /**
   * Check if a template is currently being loaded
   */
  const isLoading = (id: string): boolean => {
    return loading.value.has(id)
  }

  /**
   * Get error for a specific template
   */
  const getError = (id: string): string | undefined => {
    return errors.value.get(id)
  }

  /**
   * Fetch an exercise template from the API and store it
   */
  const fetchTemplate = async (id: string): Promise<ExerciseTemplate | null> => {
    // If already exists, return it
    const existing = templates.value.get(id)
    if (existing) {
      return existing
    }

    // If already loading, wait for it
    if (loading.value.has(id)) {
      // Wait for the loading to complete by polling
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!loading.value.has(id)) {
            resolve(templates.value.get(id) || null)
          } else {
            setTimeout(checkLoading, 50)
          }
        }
        checkLoading()
      })
    }

    // Start loading
    loading.value.add(id)
    errors.value.delete(id)

    try {
      const template = await apiRequest<ExerciseTemplate>(`/v1/exercise_templates/${id}`)

      // Store the template
      templates.value.set(id, template)

      return template
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch exercise template'
      errors.value.set(id, errorMessage)
      console.error(`Failed to fetch exercise template ${id}:`, error)
      return null
    } finally {
      // Stop loading
      loading.value.delete(id)
    }
  }

  /**
   * Fetch multiple exercise templates in parallel
   */
  const fetchTemplates = async (ids: string[]): Promise<(ExerciseTemplate | null)[]> => {
    const promises = ids.map((id) => fetchTemplate(id))
    return Promise.all(promises)
  }

  /**
   * Store a template directly (useful for caching from other API responses)
   */
  const setTemplate = (template: ExerciseTemplate): void => {
    templates.value.set(template.id, template)
  }

  /**
   * Store multiple templates
   */
  const setTemplates = (templateList: ExerciseTemplate[]): void => {
    templateList.forEach((template) => {
      templates.value.set(template.id, template)
    })
  }

  /**
   * Clear all templates (useful for logout)
   */
  const clearTemplates = (): void => {
    templates.value.clear()
    loading.value.clear()
    errors.value.clear()
  }

  /**
   * Get all stored templates as an array
   */
  const getAllTemplates = (): ExerciseTemplate[] => {
    return Array.from(templates.value.values())
  }

  return {
    // State
    templates,
    loading,
    errors,

    // Getters
    getTemplate,
    isLoading,
    getError,
    getAllTemplates,

    // Actions
    fetchTemplate,
    fetchTemplates,
    setTemplate,
    setTemplates,
    clearTemplates,
  }
})
