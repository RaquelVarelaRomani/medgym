import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createRoutineExercise = (routineId, exerciseId, description, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises`,
    fetchConfig("POST", { exerciseId, description }),
    onSuccess,
    onErrors
)

// ROUTINEEXERCISEID ES RELATIVO A ROUTINEID, NO GENERAL
export const getRoutineExercise = (routineId, exerciseId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${exerciseId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const updateRoutineExercise = (routineId, exerciseId, description, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${exerciseId}`,
    fetchConfig("PUT", { description }),
    onSuccess,
    onErrors
)

export const deleteRoutineExercise = (routineId, exerciseId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${exerciseId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)