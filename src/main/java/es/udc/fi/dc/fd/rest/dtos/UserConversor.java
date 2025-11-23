package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class UserConversor {

    private UserConversor() {
    }

    public static UserDto toUserDto(User user) {
        Double bmi = null;
        if (user.getWeightKg() != null && user.getHeightCm() != null && user.getHeightCm() > 0) {
            double hMeters = user.getHeightCm() / 100.0;
            double raw = user.getWeightKg() / (hMeters * hMeters);
            //redondeo a 2 decimales
            bmi = BigDecimal.valueOf(raw).setScale(2, RoundingMode.HALF_UP).doubleValue();
        }

        String genderStr = user.getGender() != null ? user.getGender().name() : null;

        UserDto userDto = new UserDto();

        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setSurname(user.getSurname());
        userDto.setEmail(user.getEmail());
        userDto.setPhoneNumber(user.getPhoneNumber());
        userDto.setProfilePicture(user.getProfilePicture());
        userDto.setRole(user.getRole().toString());
        userDto.setStatus(user.getStatus().toString());
        userDto.setWeightKg(user.getWeightKg());
        userDto.setHeightCm(user.getHeightCm());
        userDto.setGender(genderStr);
        userDto.setBmi(bmi);
        userDto.setTrainerPremium(user.getTrainerPremium());

        return userDto;
    }

    public static List<UserDto> toUserDtos(List<User> users) {
        List<UserDto> userDtos = new ArrayList<>();

        for (User user : users) {
            userDtos.add(UserConversor.toUserDto(user));
        }

        return userDtos;
    }

    public static User toUser(UserDto userDto) {
        User user = new User(
                safeTrim(userDto.getName()),
                safeTrim(userDto.getSurname()),
                safeTrim(userDto.getEmail()),
                safeTrim(userDto.getPhoneNumber()),
                userDto.getPassword(),
                userDto.getRole() != null ? RoleType.valueOf(userDto.getRole()) : RoleType.CLIENT,
                userDto.getStatus() != null ? User.StatusType.valueOf(userDto.getStatus()) : User.StatusType.ACTIVE
        );

        user.setProfilePicture(userDto.getProfilePicture());

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


    public static AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, User user) {
        return new AuthenticatedUserDto(serviceToken, toUserDto(user));

    }

    private static String safeTrim(String s) {
        return s == null ? null : s.trim();
    }
}

