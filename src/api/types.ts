// TypeScript interfaces for Hevy API and Fitbit API

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
  superset_id?: string
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

// Fitbit API Types
export interface FitbitActivityLevel {
  minutes: number
  name: 'sedentary' | 'lightly' | 'fairly' | 'very'
}

export interface FitbitActiveZoneMinutes {
  minutesInHeartRateZones: FitbitHeartRateZone[]
  totalMinutes: number
}

export interface FitbitHeartRateZone {
  minuteMultiplier: number
  minutes: number
  order: number
  type: 'OUT_OF_ZONE' | 'FAT_BURN' | 'CARDIO' | 'PEAK'
  zoneName: 'Out of Range' | 'Fat Burn' | 'Cardio' | 'Peak'
}

export interface FitbitManualValues {
  calories: boolean
  distance: boolean
  steps: boolean
}

export interface FitbitActivitySource {
  id: string
  name: string
  type: string
  url?: string
}

export interface FitbitActivity {
  activeDuration: number
  activityLevel: FitbitActivityLevel[]
  activityName: string
  activityTypeId: number
  averageHeartRate?: number
  calories: number
  caloriesLink?: string
  detailsLink?: string
  distance?: number
  distanceUnit?: string
  duration: number
  elevationGain?: number
  hasActiveZoneMinutes?: boolean
  hasStartTime?: boolean
  isFavorite?: boolean
  lastModified: string
  logId: number
  logType: 'auto_detected' | 'manual' | 'mobile_run' | 'tracker'
  manualValuesSpecified: FitbitManualValues
  originalDuration: number
  originalStartTime: string
  pace?: number
  source?: FitbitActivitySource
  speed?: number
  startTime: string
  steps?: number
  tcxLink?: string
  activeZoneMinutes?: FitbitActiveZoneMinutes
}

export interface FitbitActivityPagination {
  afterDate?: string
  beforeDate?: string
  limit: number
  next: string
  offset: number
  previous: string
  sort: 'asc' | 'desc'
}

export interface FitbitActivityLogListResponse {
  activities: FitbitActivity[]
  pagination: FitbitActivityPagination
}

export interface FitbitActivityLogListParams {
  beforeDate?: string // Format: yyyy-MM-ddTHH:mm:ss or yyyy-MM-dd
  afterDate?: string // Format: yyyy-MM-ddTHH:mm:ss or yyyy-MM-dd
  sort: 'asc' | 'desc' // Use 'asc' with afterDate, 'desc' with beforeDate
  limit: number // Maximum 100
  offset?: number // Currently only 0 is supported
}
