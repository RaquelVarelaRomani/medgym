package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class NotificationDto {

    private Long id;
    private String message;
    private String type;
    private Long idToRedirect;
    private Long userId;
    private boolean isRead;
    private LocalDateTime date;

    public NotificationDto() {}

    public NotificationDto(Long id, String message, String type, Long idToRedirect, Long userId, boolean isRead, LocalDateTime date) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.idToRedirect = idToRedirect;
        this.userId = userId;
        this.isRead = isRead;
        this.date = date;
    }

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

    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
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
}
