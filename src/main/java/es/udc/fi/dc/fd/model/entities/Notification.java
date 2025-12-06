package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    private Long id;
    private String message;
    private NotificationType type;
    private Long idToRedirect;
    private User user;
    private boolean isRead;
    private LocalDateTime date;

    public Notification() {
    }

    public Notification(String message, NotificationType type, Long idToRedirect, User user, boolean isRead, LocalDateTime date) {
        this.message = message;
        this.type = type;
        this.idToRedirect = idToRedirect;
        this.user = user;
        this.isRead = isRead;
        this.date = date;
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

    public enum NotificationType {
        NEW_ROUTINE,
        FOLLOW,
        ROUTINE_LIKE,
        WORKOUT_LIKE,
        WORKOUT_COMMENT,
        ACHIEVEMENT
    }

}
