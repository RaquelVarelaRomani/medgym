package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "achievement_progresses", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "achievement_id"}))
public class AchievementProgress {

    private Long id;
    private Integer progress;
    private Integer highestProgress;
    private User user;
    private Achievement achievement;

    public AchievementProgress() {
    }

    public AchievementProgress(Integer progress, User user, Achievement achievement) {
        this.progress = progress;
        this.highestProgress = progress;
        this.user = user;
        this.achievement = achievement;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Integer getProgress() {
        return progress;
    }
    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    @Column(nullable = false)
    public Integer getHighestProgress() {
        return highestProgress;
    }
    public void setHighestProgress(Integer highestProgress) {
        this.highestProgress = highestProgress;
    }

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    @ManyToOne
    @JoinColumn(name = "achievement_id")
    public Achievement getAchievement() {
        return achievement;
    }
    public void setAchievement(Achievement achievement) {
        this.achievement = achievement;
    }
}
