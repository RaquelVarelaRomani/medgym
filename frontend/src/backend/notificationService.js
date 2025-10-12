import {appFetch, fetchConfig} from "./appFetch";

export const createNotification = (routineId, onSuccess, onErrors) => appFetch(
    `/notifications`,
    fetchConfig("POST", { routineId }),
    onSuccess,
    onErrors
)

export const getUserNotifications = (onSuccess, onErrors) => appFetch(
    `/notifications`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)