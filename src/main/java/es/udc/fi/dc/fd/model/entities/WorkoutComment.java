package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "workout_comments")
public class WorkoutComment {

    private Long id;
    private String text;
    private LocalDateTime date;
    private Workout workout;
    private User user;

    public WorkoutComment(String text, LocalDateTime date, Workout workout, User user) {
        this.text = text;
        this.date = date;
        this.workout = workout;
        this.user = user;
    }

    public WorkoutComment() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getDate() {
        return date;
    }
    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "workout_id", nullable = false)
    public Workout getWorkout() {
        return workout;
    }
    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
}
