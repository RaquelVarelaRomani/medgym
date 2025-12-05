package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static es.udc.fi.dc.fd.model.entities.Notification.NotificationType;

@Service
public class NotificationServiceImpl implements NotificationService {
    private static final String PROJECT_ENTITIES_USER = "entities.user";
    private static final String PROJECT_ENTITIES_ROUTINE = "entities.routine";
    private static final String PROJECT_ENTITIES_WORKOUT = "entities.workout";
    private final NotificationDao notificationDao;
    private final UserFollowDao userFollowDao;
    private final RoutineDao routineDao;
    private final UserDao userDao;
    private final WorkoutDao workoutDao;

    public NotificationServiceImpl(NotificationDao notificationDao, UserFollowDao userFollowDao, RoutineDao routineDao, UserDao userDao, WorkoutDao workoutDao) {
        this.notificationDao = notificationDao;
        this.userFollowDao = userFollowDao;
        this.routineDao = routineDao;
        this.userDao = userDao;
        this.workoutDao = workoutDao;
    }

    @Override
    public void createNewRoutineNotification(Long routineId) throws InstanceNotFoundException {
        Routine routine = routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_ROUTINE, routineId));

        List<UserFollow> userFollows = userFollowDao.findByFollowUser(routine.getTrainer());

        userFollows.forEach(userFollow ->
                notificationDao.save(new Notification("Nueva rutina: " + routine.getName(), NotificationType.NEW_ROUTINE, routine.getId(), userFollow.getUser(), false,
                        LocalDateTime.now().withNano(0))));
    }

    @Override
    public void createFollowNotification(Long clientId, Long trainerId) throws InstanceNotFoundException {
        User client = userDao.findById(clientId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, clientId));
        User trainer = userDao.findById(trainerId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, trainerId));

        notificationDao.save(new Notification(
                client.getName() + " " + client.getSurname() + " ha comenzado a seguirte",
                NotificationType.FOLLOW,
                clientId,
                trainer,
                false,
                LocalDateTime.now().withNano(0)
        ));
    }

    @Override
    public void createRoutineLikeNotification(Long clientId, Long routineId) throws InstanceNotFoundException {
        User client = userDao.findById(clientId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, clientId));
        Routine routine = routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_ROUTINE, routineId));

        if (client.getId().equals(routine.getTrainer().getId())) {
            return;
        }

        notificationDao.save(new Notification(
                client.getName() + " " + client.getSurname() + " ha dado like a tu rutina '" + routine.getName() + "'",
                NotificationType.ROUTINE_LIKE,
                routineId,
                routine.getTrainer(),
                false,
                LocalDateTime.now().withNano(0)
        ));
    }

    @Override
    public void createWorkoutLikeNotification(Long userId, Long workoutId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, userId));
        Workout workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_WORKOUT, workoutId));

        if (user.getId().equals(workout.getUser().getId())) {
            return;
        }

        notificationDao.save(new Notification(
                user.getName() + " " + user.getSurname() + " ha dado like a tu entrenamiento de '" + workout.getRoutine().getName() + "'",
                NotificationType.WORKOUT_LIKE,
                workoutId,
                workout.getUser(),
                false,
                LocalDateTime.now().withNano(0)
        ));
    }

    @Override
    public void createWorkoutCommentNotification(Long userId, String text, Long workoutId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, userId));
        Workout workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_WORKOUT, workoutId));

        if (userId.equals(workout.getUser().getId())) {
            return;
        }

        notificationDao.save(new Notification(
                user.getName() + " " + user.getSurname() + " ha comentado tu entrenamiento de '" + workout.getRoutine().getName() + "': " + text,
                NotificationType.WORKOUT_COMMENT,
                workoutId,
                workout.getUser(),
                false,
                LocalDateTime.now().withNano(0)
        ));
    }

    @Override
    public void createStreakRemindNotification(Long clientId, int streak) throws InstanceNotFoundException {
        User client = userDao.findById(clientId).orElseThrow(() -> new InstanceNotFoundException(PROJECT_ENTITIES_USER, clientId));
        notificationDao.save(new Notification(
                "Llevas una racha de " + streak + " días. ¡No la pierdas!",
                NotificationType.STREAK_REMINDER,
                client.getId(),
                client,
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
