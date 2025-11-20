package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class WorkoutCommentDto {

    private Long id;
    private String text;
    private LocalDateTime date;
    private Long userId;
    private Long workoutId;
    String userName;
    String userSurname;
    byte[] userProfilePicture;

    public WorkoutCommentDto() {}

    public WorkoutCommentDto(Long id, String text, LocalDateTime date, Long userId, Long workoutId, String userName, String userSurname, byte[] userProfilePicture) {
        this.id = id;
        this.text = text;
        this.date = date;
        this.userId = userId;
        this.workoutId = workoutId;
        this.userName = userName;
        this.userSurname = userSurname;
        this.userProfilePicture = userProfilePicture;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getDate() {
        return date;
    }
    public void setDate(LocalDateTime date) {
        this.date = date;
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
}
