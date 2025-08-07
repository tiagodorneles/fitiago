// TypeScript interfaces for Hevy API

export interface PaginatedResponse<T> {
  workouts?: T[] // For workout responses
  data?: T[] // Generic for other responses
  page: number
  page_count: number
  page_size?: number
  total_count?: number
  has_next?: boolean
  has_previous?: boolean
}

export interface Workout {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  created_at: string
  updated_at: string
  exercises: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  exercise_template_id: string
  title: string
  notes?: string
  rest_seconds?: number
  sets: WorkoutSet[]
}

export interface WorkoutSet {
  id: string
  index: number
  set_type: 'normal' | 'warmup' | 'failure' | 'drop'
  weight_kg?: number
  reps?: number
  distance_meters?: number
  duration_seconds?: number
  rpe?: number
}

export interface Routine {
  id: string
  title: string
  notes?: string
  folder_id?: string
  created_at: string
  updated_at: string
  exercises: RoutineExercise[]
}

export interface RoutineExercise {
  id: string
  exercise_template_id: string
  title: string
  notes?: string
  rest_seconds?: number
  sets: RoutineSet[]
}

export interface RoutineSet {
  id: string
  index: number
  set_type: 'normal' | 'warmup' | 'failure' | 'drop'
  weight_kg?: number
  reps?: number
  distance_meters?: number
  duration_seconds?: number
  rpe?: number
}

export interface ExerciseTemplate {
  id: string
  title: string
  primary_muscle_group?: string
  secondary_muscle_groups?: string[]
  equipment?: string
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface RoutineFolder {
  id: string
  title: string
  index: number
  created_at: string
  updated_at: string
}

export interface WorkoutEvent {
  id: string
  event_type: 'updated' | 'deleted'
  workout_id: string
  created_at: string
  workout?: Workout
}

export interface WebhookSubscription {
  url: string
  events: string[]
  secret?: string
}

// Request body interfaces
export interface CreateWorkoutRequest {
  title: string
  description?: string
  start_time: string
  exercises: CreateWorkoutExercise[]
}

export interface CreateWorkoutExercise {
  exercise_template_id: string
  title: string
  notes?: string
  rest_seconds?: number
  sets: CreateWorkoutSet[]
}

export interface CreateWorkoutSet {
  index: number
  set_type: 'normal' | 'warmup' | 'failure' | 'drop'
  weight_kg?: number
  reps?: number
  distance_meters?: number
  duration_seconds?: number
  rpe?: number
}

export interface CreateRoutineRequest {
  title: string
  notes?: string
  folder_id?: string
  exercises: CreateRoutineExercise[]
}

export interface CreateRoutineExercise {
  exercise_template_id: string
  title: string
  notes?: string
  rest_seconds?: number
  sets: CreateRoutineSet[]
}

export interface CreateRoutineSet {
  index: number
  set_type: 'normal' | 'warmup' | 'failure' | 'drop'
  weight_kg?: number
  reps?: number
  distance_meters?: number
  duration_seconds?: number
  rpe?: number
}

export interface CreateRoutineFolderRequest {
  title: string
}

export interface UpdateWorkoutRequest extends Partial<CreateWorkoutRequest> {
  end_time?: string
}

export interface UpdateRoutineRequest extends Partial<CreateRoutineRequest> {}

// Query parameters
export interface PaginationParams {
  page?: number
  page_size?: number
  [key: string]: any
}

export interface WorkoutEventsParams extends PaginationParams {
  since?: string // ISO date string
}
