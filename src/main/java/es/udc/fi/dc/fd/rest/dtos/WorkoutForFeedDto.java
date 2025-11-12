package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;

public class WorkoutForFeedDto {

    public interface AllValidations {}

    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long routineId;
    private String routineName;
    private Long userId;
    private String userName;
    private String userSurname;
    private byte[] userProfilePicture;
    private List<WorkoutCommentDto> comments;
    private List<WorkoutLikeDto> likes;

    public WorkoutForFeedDto() {
    }

    public WorkoutForFeedDto(Long id, LocalDateTime startTime, LocalDateTime endTime, Long routineId, String routineName, Long userId, String userName, String userSurname, byte[] userProfilePicture, List<WorkoutCommentDto> comments, List<WorkoutLikeDto> likes) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.routineId = routineId;
        this.routineName = routineName;
        this.userId = userId;
        this.userName = userName;
        this.userSurname = userSurname;
        this.userProfilePicture = userProfilePicture;
        this.comments = comments;
        this.likes = likes;
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

    public byte[] getUserProfilePicture() {
        return userProfilePicture;
    }
    public void setUserProfilePicture(byte[] userProfilePicture) {
        this.userProfilePicture = userProfilePicture;
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
}
