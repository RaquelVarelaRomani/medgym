import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createRoutineExercise = (routineId, exerciseId, description, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises`,
    fetchConfig("POST", { routineId, exerciseId, description }),
    onSuccess,
    onErrors
)

// ROUTINEEXERCISEID ES RELATIVO A ROUTINEID, NO GENERAL
export const getRoutineExercise = (routineId, routineExerciseId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${routineExerciseId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const updateRoutineExercise = (routineId, routineExerciseId, description, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${routineExerciseId}`,
    fetchConfig("PUT", { description }),
    onSuccess,
    onErrors
)

export const deleteRoutineExercise = (routineId, routineExerciseId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${routineExerciseId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)