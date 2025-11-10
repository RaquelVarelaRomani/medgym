import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const likeRoutine = (routineId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/like`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
)

export const getRoutineLikes = (onSuccess, onErrors) => appFetch(
    `/routineLikes`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const unlikeRoutine = (routineId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/unlike`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)
