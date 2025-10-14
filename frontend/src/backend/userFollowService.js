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