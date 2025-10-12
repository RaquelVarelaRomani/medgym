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

export const markNotificationAsRead = (notificationId, onSuccess, onErrors) => appFetch(
    `/notifications/${notificationId}/read`,
    fetchConfig("PUT"),
    onSuccess,
    onErrors
)

export const deleteNotification = (notificationId, onSuccess, onErrors) => appFetch(
    `/notifications/${notificationId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)