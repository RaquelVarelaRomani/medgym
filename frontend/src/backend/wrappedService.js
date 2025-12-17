import { fetchConfig, appFetch } from "./appFetch";

export const getWeightComparison = (year, onSuccess, onErrors) => {
    const yearParam = year ? `?year=${year}` : '';
    return appFetch(
        `/wrapped/weight-comparison${yearParam}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};

export const getLongestStreak = (year, onSuccess, onErrors) => {
    const yearParam = year ? `?year=${year}` : '';
    return appFetch(
        `/wrapped/longest-streak${yearParam}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};