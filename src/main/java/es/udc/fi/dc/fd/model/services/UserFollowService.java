package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserFollow;

public interface UserFollowService {
    UserFollow followTrainer(Long userId, Long trainerId) throws InstanceNotFoundException;
    void unfollowTrainer(Long userId, Long trainerId) throws InstanceNotFoundException;
}
