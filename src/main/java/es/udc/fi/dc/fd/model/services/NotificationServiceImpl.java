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
    private UserFollowDao userFollowDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Override
    public void createNewRoutineNotification(Long routineId) throws InstanceNotFoundException {
        Routine routine = routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException("entities.routine", routineId));

        List<UserFollow> userFollows = userFollowDao.findByFollowUser(routine.getTrainer());

        userFollows.forEach(userFollow ->
                notificationDao.save(new Notification("Nueva rutina: " + routine.getName(), NotificationType.NEW_ROUTINE, routine.getId(), userFollow.getUser(), false,
                        LocalDateTime.now().withNano(0))));
    }

    @Override
    public void createFollowNotification(Long clientId, Long trainerId) throws InstanceNotFoundException {
        User client = userDao.findById(clientId).orElseThrow(() -> new InstanceNotFoundException("entities.user", clientId));
        User trainer = userDao.findById(trainerId).orElseThrow(() -> new InstanceNotFoundException("entities.user", trainerId));

        notificationDao.save(new Notification(
                client.getName() + " " + client.getSurname() + " ha comenzado a seguirte",
                NotificationType.FOLLOW,
                null,
                trainer,
                false,
                LocalDateTime.now().withNano(0)
        ));
    }

    @Override
    public void createRoutineLikeNotification(Long clientId, Long routineId) throws InstanceNotFoundException {
        User client = userDao.findById(clientId).orElseThrow(() -> new InstanceNotFoundException("entities.user", clientId));
        Routine routine = routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException("entities.routine", routineId));

        if (client.getId().equals(routine.getTrainer().getId())) {
            return;
        }

        notificationDao.save(new Notification(
                client.getName() + " " + client.getSurname() + " ha dado like a tu rutina '" + routine.getName() + "'",
                NotificationType.ROUTINE_LIKE,
                routine.getId(),
                routine.getTrainer(),
                false,
                LocalDateTime.now().withNano(0)
        ));
    }

    @Override
    public void createWorkoutLikeNotification(Long userId, Long workoutId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("entities.user", userId));
        Workout workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("entities.workout", workoutId));

        if (user.getId().equals(workout.getUser().getId())) {
            return;
        }

        notificationDao.save(new Notification(
                user.getName() + " " + user.getSurname() + " ha dado like a tu entrenamiento de '" + workout.getRoutine().getName() + "'",
                NotificationType.WORKOUT_LIKE,
                workout.getId(),
                workout.getUser(),
                false,
                LocalDateTime.now().withNano(0)
        ));
    }

    @Override
    public void createWorkoutCommentNotification(Long userId, String text, Long workoutId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("entities.user", userId));
        Workout workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("entities.workout", workoutId));

        if (user.getId().equals(workout.getUser().getId())) {
            return;
        }

        notificationDao.save(new Notification(
                user.getName() + " " + user.getSurname() + " ha comentado tu entrenamiento de '" + workout.getRoutine().getName() + "': " + text,
                NotificationType.WORKOUT_COMMENT,
                workout.getId(),
                workout.getUser(),
                false,
                LocalDateTime.now().withNano(0)
        ));
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
