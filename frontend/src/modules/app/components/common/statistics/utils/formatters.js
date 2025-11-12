export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
};

export const transformMuscleGroupData = (exercisesByMuscleGroup) => {
    if (!exercisesByMuscleGroup) return [];

    return Object.entries(exercisesByMuscleGroup).map(([muscle, count]) => ({
        name: muscle,
        exercises: count,
    }));
};