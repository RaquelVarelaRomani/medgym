import { fetchConfig, appFetch } from "./appFetch";

export const addOrUpdateMaxWeight = (exerciseId, maxWeightKg, onSuccess, onErrors) =>
    appFetch(
        `/exercises/${exerciseId}/maxWeight`,
        fetchConfig("POST", null, { maxWeightKg }),
        onSuccess,
        onErrors
    );

export const getRanking = (exerciseId, onSuccess, onErrors) =>
    appFetch(
        `/exercises/${exerciseId}/maxWeight/ranking`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
