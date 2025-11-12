package es.udc.fi.dc.fd.rest.dtos;

public class WorkoutLikeDto {

    private Long id;
    private Long userId;
    private Long workoutId;

    public WorkoutLikeDto() {}

    public WorkoutLikeDto(Long id, Long userId, Long workoutId) {
        this.id = id;
        this.userId = userId;
        this.workoutId = workoutId;
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

    public Long getWorkoutId() {
        return workoutId;
    }

    public void setWorkoutId(Long workoutId) {
        this.workoutId = workoutId;
    }

}
