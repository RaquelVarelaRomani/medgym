package es.udc.fi.dc.fd.rest.dtos;

public class RoutineLikeDto {

    private Long id;
    private Long userId;
    private Long routineId;

    public RoutineLikeDto() {}

    public RoutineLikeDto(Long id, Long userId, Long routineId) {
        this.id = id;
        this.userId = userId;
        this.routineId = routineId;
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

}
