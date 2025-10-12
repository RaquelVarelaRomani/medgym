package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private UserFollowService userFollowService;

    @Autowired
    private UserService userService;

    @Override
    public void createNotification(Routine routine) throws InstanceNotFoundException {
        User trainer = userService.findUserById(routine.getTrainer().getId());
        List<UserFollow> userFollows = userFollowService.getFollowers(routine.getTrainer().getId());

        for (UserFollow userFollow : userFollows) {
            notificationDao.save(new Notification(routine, userFollow.getUser(), false,
                    LocalDateTime.now().withNano(0)));
        }
    }

    @Override
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationDao.findByUserIdOrderByDateDesc(userId);
    }
}
