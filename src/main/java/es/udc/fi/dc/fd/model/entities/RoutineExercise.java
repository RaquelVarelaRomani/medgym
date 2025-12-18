package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "routine_exercises", uniqueConstraints = @UniqueConstraint(columnNames = {"routine_id", "exercise_id"}))
public class RoutineExercise {
    private Long id;
    private Routine routine;
    private Exercise exercise;
    private Integer position;

    public RoutineExercise() {
    }

    public RoutineExercise(Routine routine, Exercise exercise, Integer position) {
        this.routine = routine;
        this.exercise = exercise;
        this.position = position;
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


    @Column(name = "position")
    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}
