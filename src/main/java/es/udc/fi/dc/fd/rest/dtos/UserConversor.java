package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.User;

public class UserConversor {

	private UserConversor() {
	}

	public static final UserDto toUserDto(User user) {
		return new UserDto(user.getId(), user.getName(), user.getSurname(), user.getEmail(), user.getPhoneNumber(), user.getRole().toString());
	}

	public static final User toUser(UserDto userDto) {
		return new User(userDto.getName(), userDto.getSurname(), userDto.getEmail(), userDto.getPhoneNumber(), userDto.getPassword());
	}

	public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, User user) {
		return new AuthenticatedUserDto(serviceToken, toUserDto(user));

	}

}

