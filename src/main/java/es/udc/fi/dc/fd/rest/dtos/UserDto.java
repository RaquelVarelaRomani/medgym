package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserDto {

	public interface AllValidations {}
	public interface UpdateValidations {}

	private Long id;
	private String name;
	private String surname;
	private String email;
	private String phoneNumber;
	private String password;
	private byte[] profilePicture;
	private String role;

	public UserDto() {}

	public UserDto(Long id, String name, String surname, String email, String phoneNumber, byte[] profilePicture, String role) {

		this.id = id;
		this.name = name.trim();
		this.surname = surname.trim();
		this.email = email.trim();
		this.phoneNumber = phoneNumber.trim();
		this.role = role.trim();
		this.profilePicture = profilePicture;
		this.role = role.trim();
		
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}

	@NotNull(groups={AllValidations.class})
	@Size(min=1, max=50, groups={AllValidations.class})
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name.trim();
	}

	@NotNull(groups={AllValidations.class, UpdateValidations.class})
	@Size(min=1, max=50, groups={AllValidations.class, UpdateValidations.class})
	public String getSurname() {
		return surname;
	}
	public void setSurname(String surname) {
		this.surname = surname.trim();
	}

	@NotNull(groups={AllValidations.class, UpdateValidations.class})
	@Size(min=1, max=100, groups={AllValidations.class, UpdateValidations.class})
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email.trim();
	}

	@NotNull(groups={AllValidations.class, UpdateValidations.class})
	@Size(min=1, max=20, groups={AllValidations.class, UpdateValidations.class})
	public String getPhoneNumber() {
		return phoneNumber;
	}
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber.trim();
	}

	@NotNull(groups={AllValidations.class})
	@Size(min=1, max=255, groups={AllValidations.class})
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

	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}

}

