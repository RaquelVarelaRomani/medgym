package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", uniqueConstraints = @UniqueConstraint(name = "wrapped_daily", columnNames = {"user_id", "target_date", "type", "id_to_redirect"}))
public class Notification {

    private Long id;
    private String message;
    private NotificationType type;
    private Long idToRedirect;
    private User user;
    private boolean isRead;
    private LocalDateTime date;
    private java.time.LocalDate targetDate;

    public Notification() {
    }

    public Notification(String message, NotificationType type, Long idToRedirect, User user, boolean isRead, LocalDateTime date, java.time.LocalDate targetDate) {
        this.message = message;
        this.type = type;
        this.idToRedirect = idToRedirect;
        this.user = user;
        this.isRead = isRead;
        this.date = date;
        this.targetDate = targetDate;
    }

    public Notification(String message, NotificationType type, Long idToRedirect, User user, boolean isRead, LocalDateTime date) {
        this(message, type, idToRedirect, user, isRead, date, null);
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Column(name = "id_to_redirect")
    public Long getIdToRedirect() {
        return idToRedirect;
    }

    public void setIdToRedirect(Long idToRedirect) {
        this.idToRedirect = idToRedirect;
    }

    @Enumerated(EnumType.ORDINAL)
    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    @Column(name = "target_date")
    public java.time.LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(java.time.LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public enum NotificationType {
        NEW_ROUTINE,
        FOLLOW,
        ROUTINE_LIKE,
        WORKOUT_LIKE,
        WORKOUT_COMMENT,
        STREAK_REMINDER,
        ACHIEVEMENT,
        RANKING_SURPASS_WORKOUT,
        RANKING_SURPASS_EXERCISE,
        WRAPPED_REMINDER
    }

}
