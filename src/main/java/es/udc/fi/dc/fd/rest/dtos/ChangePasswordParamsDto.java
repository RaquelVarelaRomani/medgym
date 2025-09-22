package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ChangePasswordParamsDto {

	private String oldPassword;
	private String newPassword;

	public ChangePasswordParamsDto() {
		super();
	}

	@NotNull
	public String getOldPassword() {
		return oldPassword;
	}
	public void setOldPassword(String oldPassword) {
		this.oldPassword = oldPassword;
	}

	@NotNull
	@Size(min = 1, max = 60)
	public String getNewPassword() {
		return newPassword;
	}
	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}

}
