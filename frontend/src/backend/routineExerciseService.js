import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createRoutineExercise = (routineId, exerciseId, position, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises`,
    fetchConfig("POST", { exerciseId, position }),
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

export const getRoutineExercises = (routineId, onSuccess, onErrors) => {
    const fetchPage = (page, allContent = []) => {
        appFetch(
            `/routines/${routineId}/exercises?page=${page}`,
            fetchConfig("GET"),
            (pageData) => {
                const content = pageData.content || [];
                allContent = allContent.concat(content);

                if (pageData.totalPages && page < pageData.totalPages - 1) {
                    fetchPage(page + 1, allContent);
                } else {
                    const combinedPage = {
                        ...pageData,
                        content: allContent,
                        totalPages: 1,
                        totalElements: allContent.length,
                        number: 0,
                        size: allContent.length,
                        numberOfElements: allContent.length,
                        first: true,
                        last: true
                    };
                    onSuccess(combinedPage);
                }
            },
            onErrors
        );
    };

    fetchPage(0);
}

export const updateRoutineExercise = (routineId, exerciseId, position, onSuccess, onErrors) => appFetch(
    `/routines/${routineId}/exercises/${exerciseId}`,
    fetchConfig("PUT", { position }),
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