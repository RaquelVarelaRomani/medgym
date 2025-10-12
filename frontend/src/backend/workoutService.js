import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const startWorkout = (routineId, onSuccess, onErrors) => appFetch(
    `/workouts/start`,
    fetchConfig("POST", { routineId }),
    onSuccess,
    onErrors
)

export const finishWorkout = (workoutId, onSuccess, onErrors) => appFetch(
    `/workouts/${workoutId}/finish`,
    fetchConfig("PUT"),
    onSuccess,
    onErrors
)

export const getWorkouts = (onSuccess, onErrors) => appFetch(
    `/workouts`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)