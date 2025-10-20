import {appFetch, fetchConfig} from "./appFetch";

export const followTrainer = (trainerId, onSuccess, onErrors) => appFetch(
    `/users/follow/${trainerId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
)

export const unfollowTrainer = (trainerId, onSuccess, onErrors) => appFetch(
    `/users/follow/${trainerId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)

export const getFollowers = (trainerId, onSuccess, onErrors) => appFetch(
    `/users/follow/followers/${trainerId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
)

export const getFollowedTrainers = (userId, onSuccess, onErrors) => appFetch(
        `/users/follow/client/${userId}/following`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
)