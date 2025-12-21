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

export const getTopExercises = (onSuccess, onErrors) => {
    return appFetch(
        `/wrapped/topexercises`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};

export const getFavoriteMuscleGroup = (onSuccess, onErrors) => {
    return appFetch(
        `/wrapped/musclegroup`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};

export const getFavoriteRoutine = (onSuccess, onErrors) => {
    return appFetch(
        `/wrapped/routine`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};

export const getAnnualSummary = (onSuccess, onErrors) => {
    return appFetch(
        `/summary/annual`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};