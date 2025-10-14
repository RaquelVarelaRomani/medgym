package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise {

    private Long id;
    private Short reps;
    private Short weight;
    private Short durationSeconds;
    private Workout workout;
    private RoutineExercise routineExercise;

    public WorkoutExercise() {
    }

    public WorkoutExercise(Short reps, Short weight, Short durationSeconds, Workout workout, RoutineExercise routineExercise) {
        this.reps = reps;
        this.weight = weight;
        this.durationSeconds = durationSeconds;
        this.workout = workout;
        this.routineExercise = routineExercise;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @ManyToOne
    @JoinColumn(name = "workout_id")
    public Workout getWorkout() {
        return workout;
    }
    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    @ManyToOne
    @JoinColumn(name = "routine_exercise_id")
    public RoutineExercise getRoutineExercise() {
        return routineExercise;
    }
    public void setRoutineExercise(RoutineExercise routineExercise) {
        this.routineExercise = routineExercise;
    }
}
