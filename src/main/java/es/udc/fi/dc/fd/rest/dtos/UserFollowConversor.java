package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.UserFollow;

import java.util.List;
import java.util.stream.Collectors;

public class UserFollowConversor {
    private UserFollowConversor() {
    }

    public static UserFollowDto toUserFollowDto(UserFollow userFollow) {
        UserFollowDto userFollowDto = new UserFollowDto();

        userFollowDto.setId(userFollow.getId());
        userFollowDto.setUserId(userFollow.getUser().getId());
        userFollowDto.setTrainerId(userFollow.getFollowUser().getId());
        userFollowDto.setTrainerUserName(userFollow.getFollowUser().getName());
        userFollowDto.setTrainerUserSurname(userFollow.getFollowUser().getSurname());
        userFollowDto.setTrainerUserEmail(userFollow.getFollowUser().getEmail());
        userFollowDto.setUserName(userFollow.getUser().getName());
        userFollowDto.setUserSurname(userFollow.getUser().getSurname());
        userFollowDto.setUserEmail(userFollow.getUser().getEmail());

        return userFollowDto;
    }


    public static List<UserFollowDto> toUserFollowDtos(List<UserFollow> userFollows) {
        return userFollows.stream().map(UserFollowConversor::toUserFollowDto).collect(Collectors.toList());
    }
}
