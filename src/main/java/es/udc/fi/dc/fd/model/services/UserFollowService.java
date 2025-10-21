package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserFollow;

import java.util.List;

public interface UserFollowService {
    UserFollow followTrainer(Long userId, Long trainerId) throws InstanceNotFoundException;
    void unfollowTrainer(Long userId, Long trainerId) throws InstanceNotFoundException;
    List<UserFollow> getFollowers(Long trainerId) throws InstanceNotFoundException;
    List<UserFollow> getFollowedTrainers(Long userId) throws InstanceNotFoundException;
}
