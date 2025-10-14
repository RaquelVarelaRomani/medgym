import { fetchConfig, appFetch } from "./appFetch";

export const getAllUsers = (onSuccess, onErrors) =>
    appFetch(
        "/admin/users",
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const blockUser = (userId, onSuccess, onErrors) =>
    appFetch(
        `/admin/users/${userId}/block`,
        fetchConfig("PUT"),
        onSuccess,
        onErrors
    );

export const unblockUser = (userId, onSuccess, onErrors) =>
    appFetch(
        `/admin/users/${userId}/unblock`,
        fetchConfig("PUT"),
        onSuccess,
        onErrors
    );