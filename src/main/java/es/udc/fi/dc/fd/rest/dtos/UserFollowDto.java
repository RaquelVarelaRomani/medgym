package es.udc.fi.dc.fd.rest.dtos;

public class UserFollowDto {
    private Long id;
    private Long userId;
    private Long trainerId;
    private String trainerUserName;
    private String trainerUserSurname;
    private String trainerUserEmail;
    private String userName;
    private String userSurname;
    private String userEmail;

    // No parameter constructor because of sonarqube restrictions

    public UserFollowDto() {}

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

    public String getUserEmail() {
        return userEmail;
    }
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getTrainerUserName() {
        return trainerUserName;
    }

    public void setTrainerUserName(String trainerUserName) {
        this.trainerUserName = trainerUserName;
    }

    public String getTrainerUserSurname() {
        return trainerUserSurname;
    }

    public void setTrainerUserSurname(String trainerUserSurname) {
        this.trainerUserSurname = trainerUserSurname;
    }

    public String getTrainerUserEmail() {
        return trainerUserEmail;
    }

    public void setTrainerUserEmail(String trainerUserEmail) {
        this.trainerUserEmail = trainerUserEmail;
    }
}
