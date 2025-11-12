import { appFetch, fetchConfig } from "./appFetch";

export const likeWorkout = (workoutId, onSuccess, onErrors) =>
    appFetch(
        `/workouts/${workoutId}/like`,
        fetchConfig("POST"),
        onSuccess,
        onErrors
    );

export const unlikeWorkout = (workoutId, onSuccess, onErrors) =>
    appFetch(
        `/workouts/${workoutId}/unlike`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
    );

export const getLikesByUser = (onSuccess, onErrors) =>
    appFetch(
        `/workoutLikes`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
