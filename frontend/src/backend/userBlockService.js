import { appFetch, fetchConfig } from "./appFetch";

export const isBlocked = (otherUserId, onSuccess, onError) =>
    appFetch(
        `/blocks/has-blocked/${otherUserId}`,
        fetchConfig("GET"),
        onSuccess,
        onError
    );

export const blockUser = (blockedId, onSuccess, onError) =>
    appFetch(
        `/blocks/${blockedId}`,
        fetchConfig("POST"),
        onSuccess,
        onError
    );

export const unblockUser = (blockedId, onSuccess, onError) =>
    appFetch(
        `/blocks/${blockedId}`,
        fetchConfig("DELETE"),
        onSuccess,
        onError
    );
