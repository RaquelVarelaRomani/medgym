package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;

import java.util.ArrayList;
import java.util.List;

public class UserConversor {

	private UserConversor() {
	}

	public static final UserDto toUserDto(User user) {
		return new UserDto(user.getId(), user.getName(), user.getSurname(), user.getEmail(), user.getPhoneNumber(), user.getRole().toString());
	}

	public static final List<UserDto> toUserDtos(List<User> users) {
		List<UserDto> userDtos = new ArrayList<>();

		for (User user : users) {
			userDtos.add(UserConversor.toUserDto(user));
		}

		return userDtos;
	}

	public static final User toUser(UserDto userDto) {
		return new User(userDto.getName(), userDto.getSurname(), userDto.getEmail(), userDto.getPhoneNumber(), userDto.getPassword(), RoleType.valueOf(userDto.getRole()));
	}

	public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, User user) {
		return new AuthenticatedUserDto(serviceToken, toUserDto(user));

	}

}

