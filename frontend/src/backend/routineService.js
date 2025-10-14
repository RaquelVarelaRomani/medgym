import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createRoutine = (name, description, trainerId, visibility, difficulty, onSuccess, onErrors) => appFetch(
    `/routines`,
    fetchConfig("POST", { name, description, trainerId, visibility, difficulty }),
    onSuccess,
    onErrors
)

export const getRoutine = (id, onSuccess, onErrors) => appFetch(
    `/routines/${id}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const getAllRoutines = (onSuccess, onErrors) => appFetch(
    `/routines`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const updateRoutine = (id, name, description, visibility, onSuccess, onErrors) => appFetch(
    `/routines/${id}`,
    fetchConfig("PUT", { name, description, visibility }),
    onSuccess,
    onErrors
)

export const deleteRoutine = (id, onSuccess, onErrors) => appFetch(
    `/routines/${id}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)