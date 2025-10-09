package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class WorkoutDto {

    public interface AllValidations {}

    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long routineId;
    private Long userId;

    public WorkoutDto() {
    }

    public WorkoutDto(Long id, LocalDateTime startTime, LocalDateTime endTime, Long routineId, Long userId) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.routineId = routineId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    @NotNull(groups = {AllValidations.class})
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
}
