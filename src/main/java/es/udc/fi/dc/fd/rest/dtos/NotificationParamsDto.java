package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class NotificationParamsDto {

    private Long routineId;

    public NotificationParamsDto() {
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
