import {
    fetchConfig,
    appFetch
} from "./appFetch";

export const createOrUpdateAchievementProgress = (
    achievementId,
    progress,
    onSuccess,
    onErrors
) =>
    appFetch(
        `/achievements/${achievementId}/progress`,
        fetchConfig("POST", { progress }),
        onSuccess,
        onErrors
    );

export const onFinishWorkoutAchievements = (
    seconds,
    reps,
    onSuccess,
    onErrors
) =>
    appFetch(
        `/achievements/onFinishWorkout`,
        fetchConfig("POST", { 'seconds': seconds, 'reps': reps }),
        onSuccess,
        onErrors
    );

export const getAchievementProgress = (
    achievementId,
    onSuccess,
    onErrors
) =>
    appFetch(
        `/achievements/${achievementId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const getAllAchievementProgresses = (
    onSuccess,
    onErrors
) =>
    appFetch(
        `/achievements`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
