package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class RoutineLikeDto {

    private Long id;
    private Long userId;
    private Long routineId;
    private LocalDateTime date;

    public RoutineLikeDto() {}

    public RoutineLikeDto(Long id, Long userId, Long routineId, LocalDateTime date) {
        this.id = id;
        this.userId = userId;
        this.routineId = routineId;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
