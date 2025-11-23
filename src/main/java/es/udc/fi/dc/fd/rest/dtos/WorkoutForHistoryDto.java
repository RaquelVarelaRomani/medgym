package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class WorkoutForHistoryDto {

    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long routineId;
    private String routineName;
    private Long userId;
    private String userName;
    private String userSurname;
    private List<WorkoutCommentDto> comments;
    private List<WorkoutLikeDto> likes;
    public WorkoutForHistoryDto() {
        // No-args constructor required for Jackson and frameworks.
        // Nested comment: implementation intentionally empty because the DTO
        // is only used as a data carrier and all fields are set via setters,
        // satisfying SonarQube rules regarding unused or empty methods.
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

    public String getRoutineName() {
        return routineName;
    }

    public void setRoutineName(String routineName) {
        this.routineName = routineName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserSurname() {
        return userSurname;
    }

    public void setUserSurname(String userSurname) {
        this.userSurname = userSurname;
    }

    public List<WorkoutCommentDto> getComments() {
        return comments;
    }

    public void setComments(List<WorkoutCommentDto> comments) {
        this.comments = comments;
    }

    public List<WorkoutLikeDto> getLikes() {
        return likes;
    }

    public void setLikes(List<WorkoutLikeDto> likes) {
        this.likes = likes;
    }

    public interface AllValidations {
    }
}
