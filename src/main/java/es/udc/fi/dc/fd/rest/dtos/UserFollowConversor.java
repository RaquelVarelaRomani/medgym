package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.UserFollow;

import java.util.List;
import java.util.stream.Collectors;

public class UserFollowConversor {
    private UserFollowConversor() {}

    public static UserFollowDto toUserFollowDto(UserFollow userFollow) {
        return new UserFollowDto(userFollow.getId(), userFollow.getUser().getId(), userFollow.getTrainer().getId(), userFollow.getUser().getName(), userFollow.getUser().getSurname(), userFollow.getUser().getEmail());
    }

    public static List<UserFollowDto> toUserFollowDtos(List<UserFollow> userFollows) {
        return userFollows.stream().map(UserFollowConversor::toUserFollowDto).collect(Collectors.toList());
    }
}
