package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class NotificationNewRoutineParamsDto {

    private Long routineId;

    public NotificationNewRoutineParamsDto() {
        super();
    }

    @NotNull
    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

}
