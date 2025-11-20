package es.udc.fi.dc.fd.rest.dtos;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;

public class UserConversor {

	private UserConversor() {
	}

	public static final UserDto toUserDto(User user) {
		Double bmi = null;
        if (user.getWeightKg() != null && user.getHeightCm() != null && user.getHeightCm() > 0) {
            double hMeters = user.getHeightCm() / 100.0;
            double raw = user.getWeightKg() / (hMeters * hMeters);
            //redondeo a 2 decimales
            bmi = BigDecimal.valueOf(raw).setScale(2, RoundingMode.HALF_UP).doubleValue();
        }

        String genderStr = user.getGender() != null ? user.getGender().name() : null;

		return new UserDto(user.getId(), user.getName(), user.getSurname(), user.getEmail(), user.getPhoneNumber(), user.getProfilePicture(), user.getRole().toString(), user.getStatus().toString(),
		user.getWeightKg(), user.getHeightCm(), genderStr, bmi, user.getTrainerPremium());
	}

	public static final List<UserDto> toUserDtos(List<User> users) {
		List<UserDto> userDtos = new ArrayList<>();

		for (User user : users) {
			userDtos.add(UserConversor.toUserDto(user));
		}

		return userDtos;
	}

	public static final User toUser(UserDto userDto) {
		User user = new User(
            safeTrim(userDto.getName()),
            safeTrim(userDto.getSurname()),
            safeTrim(userDto.getEmail()),
            safeTrim(userDto.getPhoneNumber()),
            userDto.getPassword(),
            userDto.getProfilePicture(),
            RoleType.valueOf(userDto.getRole()),
            User.StatusType.valueOf(userDto.getStatus())
        );

        user.setWeightKg(userDto.getWeightKg());
        user.setHeightCm(userDto.getHeightCm());

        if (userDto.getGender() != null && !userDto.getGender().isBlank()) {
            try {
                user.setGender(User.GenderType.valueOf(userDto.getGender()));
            } catch (IllegalArgumentException ex) {
                //Si llega un valor inesperado, lo dejamos en null/UNSPECIFIED
                user.setGender(null);
            }
        }

        user.setTrainerPremium(userDto.getTrainerPremium());

        return user;
    }


	public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, User user) {
		return new AuthenticatedUserDto(serviceToken, toUserDto(user));

	}

	private static String safeTrim(String s) {
        return s == null ? null : s.trim();
    }
}

