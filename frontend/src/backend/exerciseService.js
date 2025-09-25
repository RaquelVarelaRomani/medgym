import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createExercise = (name, description, onSuccess, onErrors) => appFetch(
    `/exercises`,
    fetchConfig("POST", { name, description }),
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

export const updateExercise = (id, name, description, onSuccess, onErrors) => appFetch(
    `/exercises/${id}`,
    fetchConfig("PUT", { name, description }),
    onSuccess,
    onErrors
)

export const deleteExercise = (id, onSuccess, onErrors) => appFetch(
    `/exercises/${id}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)