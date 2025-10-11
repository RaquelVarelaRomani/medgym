package es.udc.fi.dc.fd.rest.dtos;

public class UserFollowDto {
    private Long id;
    private Long userId;
    private Long trainerId;

    public UserFollowDto() {}

    public UserFollowDto(Long id, Long userId, Long trainerId) {
        this.id = id;
        this.userId = userId;
        this.trainerId = trainerId;
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

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }
}
