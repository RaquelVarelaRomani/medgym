import {
    fetchConfig,
    appFetch,
} from "./appFetch";

export const commentWorkout = (workoutId, text, onSuccess, onErrors) =>
    appFetch(
        `/workouts/${workoutId}/comments`,
        fetchConfig("POST", text),
        onSuccess,
        onErrors
    );

export const getWorkoutComments = (workoutId, onSuccess, onErrors) =>
    appFetch(
        `/workouts/${workoutId}/comments`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const deleteWorkoutComment = (workoutCommentId, onSuccess, onErrors) =>
    appFetch(
        `/workoutComments/${workoutCommentId}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
    );
