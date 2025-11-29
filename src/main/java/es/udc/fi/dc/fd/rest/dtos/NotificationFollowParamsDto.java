package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class NotificationFollowParamsDto {

    private Long clientId;
    private Long trainerId;

    public NotificationFollowParamsDto() {
        super();
    }

    @NotNull
    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }

    @NotNull
    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

}
