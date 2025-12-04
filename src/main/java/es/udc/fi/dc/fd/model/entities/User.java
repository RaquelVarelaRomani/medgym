package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String phoneNumber;
    private String password;
    private byte[] profilePicture;
    private RoleType role;
    private StatusType status;
    private Double weightKg;
    private Double heightCm;
    @Enumerated(EnumType.STRING)
    private GenderType gender;
    @Column
    private Boolean trainerPremium;
    @Column
    private int totalLikesGiven = 0;
    @Column
    private int totalComments = 0;

    public User() {
    }

    public User(String name, String surname, String email, String phoneNumber, String password, RoleType role, StatusType status) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.role = role;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public byte[] getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }

    public RoleType getRole() {
        return role;
    }

    public void setRole(RoleType role) {
        this.role = role;
    }

    public StatusType getStatus() {
        return status;
    }

    public void setStatus(StatusType status) {
        this.status = status;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public GenderType getGender() {
        return gender;
    }

    public void setGender(GenderType gender) {
        this.gender = gender;
    }

    public Boolean getTrainerPremium() {
        return trainerPremium != null && trainerPremium;
    }

    public void setTrainerPremium(Boolean trainerPremium) {
        this.trainerPremium = trainerPremium;
    }

    public int getTotalLikesGiven() {
        return totalLikesGiven;
    }

    public void setTotalLikesGiven(int totalLikesGiven) {
        this.totalLikesGiven = totalLikesGiven;
    }

    public int getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(int totalComments) {
        this.totalComments = totalComments;
    }

    public enum RoleType {
        CLIENT,
        TRAINER,
        ADMIN
    }

    public enum StatusType {
        ACTIVE,
        BLOCKED
    }

    public enum GenderType {
        MALE,
        FEMALE,
        OTHER,
        UNSPECIFIED
    }

}
