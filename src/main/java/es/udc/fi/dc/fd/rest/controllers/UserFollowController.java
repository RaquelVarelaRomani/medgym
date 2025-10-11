package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import static es.udc.fi.dc.fd.rest.dtos.UserFollowConversor.toUserFollowDto;
import es.udc.fi.dc.fd.model.services.UserFollowService;
import es.udc.fi.dc.fd.rest.dtos.UserFollowDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow/coach")
public class UserFollowController {
    @Autowired
    private UserFollowService userFollowService;

    @PostMapping("/{trainerId}")
    public UserFollowDto followTrainer(@PathVariable Long trainerId, @RequestAttribute Long userId) throws InstanceNotFoundException {
        return toUserFollowDto(userFollowService.followTrainer(userId, trainerId));
    }

    @DeleteMapping("/{trainerId}")
    public void unfollowTrainer(@PathVariable Long trainerId, @RequestAttribute Long userId) throws InstanceNotFoundException {
        userFollowService.unfollowTrainer(userId, trainerId);
    }
}
