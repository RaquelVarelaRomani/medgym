package es.udc.fi.dc.fd.model.services;


import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserFollow;
import es.udc.fi.dc.fd.model.entities.UserFollowDao;
import es.udc.fi.dc.fd.model.services.exceptions.FollowException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class UserFollowImpl implements UserFollowService {
    @Autowired
    private UserFollowDao userFollowDao;
    @Autowired
    private UserService userService;

    @Override
    public UserFollow followTrainer(Long userId, Long trainerId) throws InstanceNotFoundException {
        User trainer = userService.findUserById(trainerId);

        if (trainer.getRole() != User.RoleType.TRAINER || Objects.equals(userId, trainerId)){
            throw new FollowException(trainerId);
        }

        User user = userService.loginFromId(userId);

        if(userFollowDao.existsByUserAndTrainer(user, trainer)){
            throw new FollowException(trainerId);
        }

        return userFollowDao.save(new UserFollow(user, trainer));
    }

    @Override
    public void unfollowTrainer(Long userId, Long trainerId) throws InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        User trainer = userService.findUserById(trainerId);

        Optional<UserFollow> userFollow = userFollowDao.findByUserAndTrainer(user, trainer);

        if(userFollow.isEmpty()){
            throw new FollowException(trainerId);
        }

        userFollowDao.delete(userFollow.get());
    }

    @Override
    public List<UserFollow> getFollowers(Long trainerId) throws InstanceNotFoundException {
        return userFollowDao.findByTrainer(userService.findUserById(trainerId));
    }
}
