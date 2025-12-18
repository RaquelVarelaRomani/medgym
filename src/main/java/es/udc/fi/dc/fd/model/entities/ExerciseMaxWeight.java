package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "exercise_max_weights", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "exercise_id"}))
public class ExerciseMaxWeight {

    private Long id;
    private Short maxWeightKg;
    private User user;
    private Exercise exercise;

    public ExerciseMaxWeight() {}

    public ExerciseMaxWeight(Short maxWeightKg, User user, Exercise exercise) {
        this.maxWeightKg = maxWeightKg;
        this.user = user;
        this.exercise = exercise;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Short getMaxWeightKg() {
        return maxWeightKg;
    }
    public void setMaxWeightKg(Short maxWeightKg) {
        this.maxWeightKg = maxWeightKg;
    }

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    public Exercise getExercise() {
        return exercise;
    }
    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }
}
