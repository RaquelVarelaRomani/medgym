package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;

import java.util.List;

public interface NotificationService {
    void createNewRoutineNotification(Long routineId) throws InstanceNotFoundException;

    void createFollowNotification(Long clientId, Long trainerId) throws InstanceNotFoundException;

    void createRoutineLikeNotification(Long clientId, Long routineId) throws InstanceNotFoundException;

    void createWorkoutLikeNotification(Long userId, Long workoutId) throws InstanceNotFoundException;

    void createWorkoutCommentNotification(Long userId, String text, Long workoutId) throws InstanceNotFoundException;

    void createStreakRemindNotification(Long clientId, int streak) throws InstanceNotFoundException;

    void createAchievementNotification(Long userId, String message, Long idToRedirect) throws InstanceNotFoundException;

    void createRankingSurpassNotification(Long surpassedUserId, Long surpassingUserId, Long routineId) throws InstanceNotFoundException;

    void createExerciseRankingSurpassNotification(Long surpassedUserId, Long surpassingUserId, Long exerciseId) throws InstanceNotFoundException;

    List<Notification> getNotificationsByUser(Long userId);

    void markNotificationAsRead(Long notificationId);

    void deleteNotification(Long notificationId);

    void deleteNotificationsByIdToRedirect(Long idToRedirect);

    void createDailyWrappedReminders();
}
