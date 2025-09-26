import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createRoutineExercise = (routineId, exerciseId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises`,
    fetchConfig("POST", { exerciseId }),
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

export const getRoutineExercises = (routineId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

// update ya no tiene sentido ya que no tiene atributos propios
export const deleteRoutineExercise = (routineId, exerciseId, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${exerciseId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)