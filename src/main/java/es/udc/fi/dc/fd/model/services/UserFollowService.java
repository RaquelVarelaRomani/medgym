package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.UserFollow;

import java.util.List;

public interface UserFollowService {
    UserFollow followUser(Long userId, Long followUserId) throws InstanceNotFoundException;

    void unfollowUser(Long userId, Long followUserId) throws InstanceNotFoundException;

    List<UserFollow> getFollowers(Long userId) throws InstanceNotFoundException;

    List<UserFollow> getFollowedUsers(Long userId) throws InstanceNotFoundException;
}
