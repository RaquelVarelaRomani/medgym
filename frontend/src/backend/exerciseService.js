import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createExercise = (name, description, muscleGroup, equipment, image, onSuccess, onErrors) => appFetch(
    `/exercises`,
    fetchConfig("POST", { name, description, muscleGroup, equipment, image }),
    onSuccess,
    onErrors
)

export const getExercise = (id, onSuccess, onErrors) => appFetch(
    `/exercises/${id}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const getAllExercises = (onSuccess, onErrors) => appFetch(
    `/exercises`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const updateExercise = (id, name, description, muscleGroup, equipment, image, onSuccess, onErrors) => appFetch(
    `/exercises/${id}`,
    fetchConfig("PUT", { name, description, muscleGroup, equipment, image }),
    onSuccess,
    onErrors
)

export const updateExerciseStatus = (id, status, onSuccess, onErrors) => appFetch(
    `/exercises/${id}/status`,
    fetchConfig("PUT", { status }),
    onSuccess,
    onErrors
)

export const getPendingExercises = (onSuccess, onErrors) => appFetch(
    `/exercises/pending`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const deleteExercise = (id, onSuccess, onErrors) => appFetch(
    `/exercises/${id}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)

export const getExercisesByStatus = (status, onSuccess, onErrors) => {
    const queryParam = status ? `?status=${encodeURIComponent(status)}` : "";
    return appFetch(
        `/exercises${queryParam}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};