import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const addWorkoutExercise = (workoutId, reps, weight, durationSeconds, routineExerciseId, onSuccess, onErrors) => appFetch(
    `/workouts/${workoutId}/log`,
    fetchConfig("POST", { reps, weight, durationSeconds, routineExerciseId }),
    onSuccess,
    onErrors
)

export const getWorkoutExercisesByWorkoutId = (workoutId, onSuccess, onErrors) => appFetch(
    `/workouts/${workoutId}/log`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)