package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class NotificationDto {

    private Long id;
    private Long routineId;
    private Long userId;
    private boolean isRead;
    private LocalDateTime date;
    private String message;

    public NotificationDto() {}

    public NotificationDto(Long id, Long routineId, Long userId, boolean isRead, LocalDateTime date, String message) {
        this.id = id;
        this.routineId = routineId;
        this.userId = userId;
        this.isRead = isRead;
        this.date = date;
        this.message = message;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoutineId() {
        return routineId;
    }
    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getMessage() {
        return message;
    }
    public void setMessage(String routineName, String routineDescription) {
        this.message = "New routine: " + routineName + " " + routineDescription;
    }
}
