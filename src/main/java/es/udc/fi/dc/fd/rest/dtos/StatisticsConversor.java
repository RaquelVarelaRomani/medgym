package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Workout;
import es.udc.fi.dc.fd.model.entities.WorkoutExercise;

import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class StatisticsConversor {

    public static final StatisticsDto toStatisticsDto(List<Workout> workouts, List<WorkoutExercise> performedExercises){
        int workoutCount = workouts.size();
        Long totalDuration = calculateTotalDuration(workouts);
        Double averageDuration = workoutCount > 0 ? (double) totalDuration / workoutCount : 0.0;
        Map<String, Integer> muscleGroupStats = calculateMuscleGroupStats(performedExercises);

        return new StatisticsDto(workoutCount, totalDuration, averageDuration, muscleGroupStats);
    }

    private static Long calculateTotalDuration(List<Workout> workouts){
        return workouts.stream()
                .filter(w -> w.getEndTime() != null)
                .mapToLong(w -> ChronoUnit.SECONDS.between(w.getStartTime(), w.getEndTime()))
                .sum();
    }

    private static Map<String, Integer> calculateMuscleGroupStats(List<WorkoutExercise> performedExercises) {
        Map<String, Integer> stats = new HashMap<>();

        performedExercises.forEach(we -> {
            String muscleGroup = we.getRoutineExercise()
                    .getExercise()
                    .getMuscleGroup()
                    .name();
            stats.put(muscleGroup, stats.getOrDefault(muscleGroup, 0) + 1);
        });

        return stats;
    }

}
