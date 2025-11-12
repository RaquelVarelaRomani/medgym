package es.udc.fi.dc.fd.rest.dtos;

import java.util.Map;

public class StatisticsDto {
    private Integer lastMonthWorkouts;
    private Long totalDurationSeconds;
    private Double averageDurationSeconds;
    private Map<String, Integer> exercisesByMuscleGroup;

    public StatisticsDto(Integer lastMonthWorkouts, Long totalDurationSeconds, Double averageDurationSeconds, Map<String, Integer> exercisesByMuscleGroup) {
        this.lastMonthWorkouts = lastMonthWorkouts;
        this.totalDurationSeconds = totalDurationSeconds;
        this.averageDurationSeconds = averageDurationSeconds;
        this.exercisesByMuscleGroup = exercisesByMuscleGroup;
    }

    public Integer getLastMonthWorkouts() {
        return lastMonthWorkouts;
    }

    public void setLastMonthWorkouts(Integer lastMonthWorkouts) {
        this.lastMonthWorkouts = lastMonthWorkouts;
    }

    public Long getTotalDurationSeconds() {
        return totalDurationSeconds;
    }

    public void setTotalDurationSeconds(Long totalDurationSeconds) {
        this.totalDurationSeconds = totalDurationSeconds;
    }

    public Double getAverageDurationSeconds() {
        return averageDurationSeconds;
    }

    public void setAverageDurationSeconds(Double averageDurationSeconds) {
        this.averageDurationSeconds = averageDurationSeconds;
    }

    public Map<String, Integer> getExercisesByMuscleGroup() {
        return exercisesByMuscleGroup;
    }

    public void setExercisesByMuscleGroup(Map<String, Integer> exercisesByMuscleGroup) {
        this.exercisesByMuscleGroup = exercisesByMuscleGroup;
    }
}
