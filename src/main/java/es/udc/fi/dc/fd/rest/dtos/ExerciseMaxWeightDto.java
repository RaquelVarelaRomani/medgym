package es.udc.fi.dc.fd.rest.dtos;

public class ExerciseMaxWeightDto {

    private Long id;
    private Long userId;
    private String userName;
    private String userSurname;
    private byte[] userProfilePicture;
    private Short maxWeightKg;

    public ExerciseMaxWeightDto() {
    }

    public ExerciseMaxWeightDto(Long id, Long userId, String userName, String userSurname, byte[] userProfilePicture, Short maxWeightKg) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userSurname = userSurname;
        this.userProfilePicture = userProfilePicture;
        this.maxWeightKg = maxWeightKg;
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

    public Short getMaxWeightKg() {
        return maxWeightKg;
    }

    public void setMaxWeightKg(Short maxWeightKg) {
        this.maxWeightKg = maxWeightKg;
    }
}
