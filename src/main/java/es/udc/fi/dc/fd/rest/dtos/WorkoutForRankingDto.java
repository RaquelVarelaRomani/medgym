package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;

public class WorkoutForRankingDto {

    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long routineId;
    private String routineName;
    private Long userId;
    private String userName;
    private String userSurname;
    private byte[] userProfilePicture;
    private Integer totalVolume;

    public WorkoutForRankingDto() {
        // No-args constructor required for Jackson and frameworks.
        // Nested comment: implementation intentionally empty because the DTO
        // is only used as a data carrier and all fields are set via setters,
        // satisfying SonarQube rules regarding unused or empty methods.
    }

    public WorkoutForRankingDto(Long id, LocalDateTime startTime, LocalDateTime endTime, Long routineId, String routineName, Long userId, String userName, String userSurname, byte[] userProfilePicture, Integer totalVolume) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.routineId = routineId;
        this.routineName = routineName;
        this.userId = userId;
        this.userName = userName;
        this.userSurname = userSurname;
        this.userProfilePicture = userProfilePicture;
        this.totalVolume = totalVolume;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Integer getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(Integer totalVolume) {
        this.totalVolume = totalVolume;
    }
}
