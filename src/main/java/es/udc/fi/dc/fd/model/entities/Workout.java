package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "workouts")
public class Workout {

    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Routine routine;
    private User user;
    private List<WorkoutComment> comments;

    public Workout() {
    }

    public Workout(LocalDateTime startTime, LocalDateTime endTime, Routine routine, User user) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.routine = routine;
        this.user = user;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
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
    @JoinColumn(name = "user_id")
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<WorkoutComment> getComments() {
        return comments;
    }
    public void setComments(List<WorkoutComment> comments) {
        this.comments = comments;
    }

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<WorkoutLike> getLikes() {
        return likes;
    }
    public void setLikes(List<WorkoutLike> likes) {
        this.likes = likes;
    }
    private List<WorkoutLike> likes;
}
