package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "routine_exercises")
public class RoutineExercise {
    private long id;

    @ManyToOne
    @JoinColumn(name = "routine_id")
    private Routine routine;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(name = "repetitions_number")
    private byte repetitionsNumber;
    private short duration;

    public RoutineExercise() {}

    public RoutineExercise(Routine routine, Exercise exercise, byte repetitionsNumber, short duration) {
        this.routine = routine;
        this.exercise = exercise;
        this.repetitionsNumber = repetitionsNumber;
        this.duration = duration;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Routine getRoutine() {
        return routine;
    }

    public void setRoutine(Routine routine) {
        this.routine = routine;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public byte getRepetitionsNumber() {
        return repetitionsNumber;
    }

    public void setRepetitionsNumber(byte repetitionsNumber) {
        this.repetitionsNumber = repetitionsNumber;
    }

    public short getDuration() {
        return duration;
    }

    public void setDuration(short duration) {
        this.duration = duration;
    }
}
