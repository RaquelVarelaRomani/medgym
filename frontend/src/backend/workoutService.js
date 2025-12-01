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

export const getWorkout = (workoutId, onSuccess, onErrors) => appFetch(
    `/workouts/${workoutId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const getWorkouts = (onSuccess, onErrors) => appFetch(
    `/workouts`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const getWorkoutsByUser = (userId, onSuccess, onErrors) => appFetch(
    `/workouts/user/${userId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const addWorkoutExercise = (
  workoutId,
  routineExerciseId,
  reps,
  weight,
  durationSeconds,
  onSuccess,
  onErrors
) =>
  appFetch(
    `/workouts/${workoutId}/log`,
    fetchConfig("POST", {
      routineExerciseId,
      reps,
      weight,
      durationSeconds,
    }),
    onSuccess,
    onErrors
  );

export const getWorkoutExercisesByWorkoutId = (workoutId, onSuccess, onErrors) =>
  appFetch(
    `/workouts/${workoutId}/log`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );

export const getWorkoutsFromFollowing = (onSuccess, onErrors) => appFetch(
    `/workouts/following`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
);

export const getStatsForMonth = (month, year, onSuccess, onErrors) => appFetch(
    `/workouts/stats?month=${month}&year=${year}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
);
