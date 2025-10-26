import { appFetch, fetchConfig } from "./appFetch";

export const createNewRoutineNotification = (routineId, onSuccess, onErrors) =>
    appFetch(
        `/notifications/newRoutine`,
        fetchConfig("POST", { routineId }),
        onSuccess,
        onErrors
    );

export const createFollowNotification = (clientId, trainerId, onSuccess, onErrors) =>
    appFetch(
        `/notifications/follow`,
        fetchConfig("POST", { clientId, trainerId }),
        onSuccess,
        onErrors
    );

export const createLikeNotification = (clientId, trainerId, onSuccess, onErrors) =>
    appFetch(
        `/notifications/like`,
        fetchConfig("POST", { clientId, trainerId }),
        onSuccess,
        onErrors
    );

export const getUserNotifications = (onSuccess, onErrors) =>
    appFetch(
        `/notifications`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const markNotificationAsRead = (notificationId, onSuccess, onErrors) =>
    appFetch(
        `/notifications/${notificationId}/read`,
        fetchConfig("PUT"),
        onSuccess,
        onErrors
    );

export const deleteNotification = (notificationId, onSuccess, onErrors) =>
    appFetch(
        `/notifications/${notificationId}`,
        fetchConfig("DELETE"),
        onSuccess,
        onErrors
    );
