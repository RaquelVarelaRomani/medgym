package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name= "users")
public class User {

	public enum RoleType {
		CLIENT,
		TRAINER,
		ADMIN
	}

	public enum StatusType {
		ACTIVE,
		BLOCKED
	}

	private Long id;
	private String name;
	private String surname;
	private String email;
	private String phoneNumber;
	private String password;
	private byte[] profilePicture;
	private RoleType role;
	private StatusType status;

	public User() {
	}

	public User(String name, String surname, String email, String phoneNumber, String password, byte[] profilePicture, RoleType role, StatusType status) {
		this.name = name;
		this.surname = surname;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.password = password;
		this.profilePicture = profilePicture;
		this.role = role;
		this.status = status;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
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


}
