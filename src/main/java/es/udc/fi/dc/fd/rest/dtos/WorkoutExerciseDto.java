package es.udc.fi.dc.fd.rest.dtos;

public class WorkoutExerciseDto {

    public interface AllValidations {}

    private Long id;
    private Short reps;
    private Short weight;
    private Short durationSeconds;
    private Long workoutId;
    private Long routineExerciseId;

    public WorkoutExerciseDto() {
    }

    public WorkoutExerciseDto(Long id, Short reps, Short weight, Short durationSeconds, Long workoutId, Long routineExerciseId) {
        this.id = id;
        this.reps = reps;
        this.weight = weight;
        this.durationSeconds = durationSeconds;
        this.workoutId = workoutId;
        this.routineExerciseId = routineExerciseId;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Short getReps() {
        return reps;
    }
    public void setReps(Short reps) {
        this.reps = reps;
    }

    public Short getWeight() {
        return weight;
    }
    public void setWeight(Short weight) {
        this.weight = weight;
    }

    public Short getDurationSeconds() {
        return durationSeconds;
    }
    public void setDurationSeconds(Short durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Long getWorkoutId() {
        return workoutId;
    }
    public void setWorkoutId(Long workoutId) {
        this.workoutId = workoutId;
    }

    public Long getRoutineExerciseId() {
        return routineExerciseId;
    }
    public void setRoutineExerciseId(Long routineExerciseId) {
        this.routineExerciseId = routineExerciseId;
    }
}
