package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class NotificationRoutineLikeParamsDto {

    private Long clientId;
    private Long routineId;

    public NotificationRoutineLikeParamsDto() {
        super();
    }

    @NotNull
    public Long getClientId() {
        return clientId;
    }
    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    @NotNull
    public Long getRoutineId() {
        return routineId;
    }
    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

}
