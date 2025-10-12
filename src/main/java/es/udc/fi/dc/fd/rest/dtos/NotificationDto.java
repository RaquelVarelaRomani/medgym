package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private String message;
    private LocalDateTime time;

    public NotificationDto() {}

    public NotificationDto(Long id, String message, LocalDateTime time) {
        this.id = id;
        this.message = message;
        this.time = time;
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

    public void setMessage(String routineName, String routineDescription) {
        this.message = "New routine: " + routineName + " " + routineDescription;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}
