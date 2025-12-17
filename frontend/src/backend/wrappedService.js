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