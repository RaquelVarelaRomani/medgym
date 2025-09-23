package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "routine_exercises")
public class RoutineExercise {
    private Long id;
    private Routine routine;
    private Exercise exercise;
    private Byte repetitionsNumber;
    private Short duration;

    public RoutineExercise() {}

    public RoutineExercise(Routine routine, Exercise exercise, Byte repetitionsNumber, Short duration) {
        this.routine = routine;
        this.exercise = exercise;
        this.repetitionsNumber = repetitionsNumber;
        this.duration = duration;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne
    @JoinColumn(name = "routine_id")
    public Routine getRoutine() {
        return routine;
    }

    public void setRoutine(Routine routine) {
        this.routine = routine;
    }

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    @Column(name = "repetitions_number")
    public Byte getRepetitionsNumber() {
        return repetitionsNumber;
    }

    public void setRepetitionsNumber(Byte repetitionsNumber) {
        this.repetitionsNumber = repetitionsNumber;
    }

    public Short getDuration() {
        return duration;
    }

    public void setDuration(Short duration) {
        this.duration = duration;
    }
}
