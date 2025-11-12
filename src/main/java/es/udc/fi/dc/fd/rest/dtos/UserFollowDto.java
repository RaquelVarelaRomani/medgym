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

    public UserFollowDto() {}

    public UserFollowDto(Long id, Long userId, Long trainerId, String trainerUserName, String trainerUserSurname, String trainerUserEmail, String userName, String userSurname, String userEmail) {
        this.id = id;
        this.userId = userId;
        this.trainerId = trainerId;
        this.trainerUserName = trainerUserName;
        this.trainerUserSurname = trainerUserSurname;
        this.trainerUserEmail = trainerUserEmail;
        this.userName = userName;
        this.userSurname = userSurname;
        this.userEmail = userEmail;
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
