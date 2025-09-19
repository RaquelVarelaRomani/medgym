package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

/**
 * The Class LoginParamsDto.
 */
public class LoginParamsDto {

	private String email;
	private String password;

	public LoginParamsDto() {
		super();
	}

	@NotNull
	public String getEmail() {
		return email;
	}

	public void setEmail(String userName) {
		this.email = email.trim();
	}

	@NotNull
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
