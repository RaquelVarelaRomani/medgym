package es.udc.fi.dc.fd.model.services;


import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserFollow;
import es.udc.fi.dc.fd.model.entities.UserFollowDao;
import es.udc.fi.dc.fd.model.services.exceptions.FollowException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class UserFollowServiceImpl implements UserFollowService {
    @Autowired
    private UserFollowDao userFollowDao;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserBlockService userBlockService;

    @Override
    public UserFollow followUser(Long userId, Long followUserId) throws InstanceNotFoundException {
        User trainer = userService.findUserById(followUserId);

        if (Objects.equals(userId, followUserId)){
            throw new FollowException(followUserId);
        }

        User user = userService.loginFromId(userId);

        if (userBlockService.hasBlocked(followUserId, userId)) {
            throw new FollowException(followUserId);
        }

        if(userFollowDao.existsByUserAndFollowUser(user, trainer) || user.equals(trainer)){
            throw new FollowException(followUserId);
        }

        notificationService.createFollowNotification(user.getId(), trainer.getId());

        return userFollowDao.save(new UserFollow(user, trainer));
    }

    @Override
    public void unfollowUser(Long userId, Long followUserId) throws InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        User trainer = userService.findUserById(followUserId);

        Optional<UserFollow> userFollow = userFollowDao.findByUserAndFollowUser(user, trainer);

        if(userFollow.isEmpty()){
            throw new FollowException(followUserId);
        }

        userFollowDao.delete(userFollow.get());
    }

    @Override
    public List<UserFollow> getFollowers(Long userId) throws InstanceNotFoundException {
        return userFollowDao.findByFollowUser(userService.findUserById(userId));
    }

    @Override
    public List<UserFollow> getFollowedUsers(Long userId) throws InstanceNotFoundException {
        return userFollowDao.findByUser(userService.loginFromId(userId));
    }
}
