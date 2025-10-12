package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.dtos.NotificationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private UserFollowService userFollowService;

    @Override
    public void createNotification(Routine routine) throws InstanceNotFoundException {
        List<UserFollow> userFollows = userFollowService.getFollowers(routine.getTrainer().getId());

        userFollows.forEach(userFollow ->
                notificationDao.save(new Notification(routine, userFollow.getUser(), false, LocalDateTime.now().withNano(0))));
    }

    @Override
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationDao.findByUserIdOrderByDateDesc(userId);
    }

    @Override
    public void markNotificationAsRead(Long notificationId) {
        Optional<Notification> notification = notificationDao.findById(notificationId);

        notification.ifPresent(value -> {
            value.setIsRead(true);
            notificationDao.save(value);
        });
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationDao.deleteById(notificationId);
    }
}
