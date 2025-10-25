package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static es.udc.fi.dc.fd.model.entities.Notification.NotificationType;

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
    public void createNewRoutineNotification(Routine routine) throws InstanceNotFoundException {
        List<UserFollow> userFollows = userFollowService.getFollowers(routine.getTrainer().getId());

        userFollows.forEach(userFollow ->
                notificationDao.save(new Notification("Nueva rutina: " + routine.getName(), NotificationType.NEW_ROUTINE, routine.getId(), userFollow.getUser(), false,
                        LocalDateTime.now().withNano(0))));
    }

    @Override
    public void createFollowNotification(User client, User trainer) {
        notificationDao.save(new Notification(client.getName() + " " + client.getSurname() + " ha comenzado a seguirte", NotificationType.FOLLOW, null, trainer, false,
                LocalDateTime.now().withNano(0)));
    }

    @Override
    public void createLikeNotification(User client, User trainer, Routine routine) {
        notificationDao.save(new Notification(client.getName() + " ha dado like a tu rutina '" + routine.getName() + "'", NotificationType.LIKE, routine.getId(), trainer, false,
                LocalDateTime.now().withNano(0)));
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

    @Override
    public void deleteNotificationsByIdToRedirect(Long idToRedirect) {
        notificationDao.deleteByIdToRedirect(idToRedirect);
    }

}
