package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import static es.udc.fi.dc.fd.rest.dtos.UserFollowConversor.toUserFollowDto;
import es.udc.fi.dc.fd.model.services.UserFollowService;
import es.udc.fi.dc.fd.rest.dtos.UserFollowConversor;
import es.udc.fi.dc.fd.rest.dtos.UserFollowDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users/follow")
public class UserFollowController {
    @Autowired
    private UserFollowService userFollowService;

    @PostMapping("/{trainerId}")
    public UserFollowDto followTrainer(@PathVariable Long trainerId, @RequestAttribute Long userId) throws InstanceNotFoundException {
        return toUserFollowDto(userFollowService.followUser(userId, trainerId));
    }

    @DeleteMapping("/{trainerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollowTrainer(@PathVariable Long trainerId, @RequestAttribute Long userId) throws InstanceNotFoundException {
        userFollowService.unfollowUser(userId, trainerId);
    }

    @GetMapping("/followers/{trainerId}")
    public List<UserFollowDto> getFollowers(@PathVariable Long trainerId) throws InstanceNotFoundException {
        return UserFollowConversor.toUserFollowDtos(userFollowService.getFollowers(trainerId));
    }

    @GetMapping("/client/{userId}/following")
    public List<UserFollowDto> getFollowedTrainers(@PathVariable Long userId) throws InstanceNotFoundException {
        return UserFollowConversor.toUserFollowDtos(userFollowService.getFollowedUsers(userId));
    }

}
