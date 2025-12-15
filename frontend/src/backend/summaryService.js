import { fetchConfig, appFetch } from "./appFetch";

export const getAnnualSummary = (onSuccess, onErrors) =>
    appFetch(
        `/summary/annual`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );