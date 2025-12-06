package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class WorkoutLikeServiceImpl implements WorkoutLikeService {
    private final WorkoutLikeDao workoutLikeDao;
    private final NotificationService notificationService;
    private final WorkoutDao workoutDao;
    private final UserDao userDao;
    private final AchievementProgressService achievementProgressService;

    public WorkoutLikeServiceImpl(WorkoutLikeDao workoutLikeDao, NotificationService notificationService, WorkoutDao workoutDao, UserDao userDao, AchievementProgressService achievementProgressService) {
        this.workoutLikeDao = workoutLikeDao;
        this.notificationService = notificationService;
        this.workoutDao = workoutDao;
        this.userDao = userDao;
        this.achievementProgressService = achievementProgressService;
    }

    @Override
    public List<AchievementProgressDto> likeWorkout(Long userId, Long workoutId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("entities.user", userId));
        Workout workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("entities.workout", workoutId));

        if (getLikesByUser(userId).stream().anyMatch(w -> w.getWorkout().getId().equals(workoutId))) {
            return new ArrayList<>();
        }

        WorkoutLike workoutLike = new WorkoutLike(
                workout,
                user
        );
        workoutLikeDao.save(workoutLike);

        List<AchievementProgressDto> newAchievements = achievementProgressService.createOrUpdateAchievementProgress(userId, 6L, 1);

        for (AchievementProgressDto dto : newAchievements) {
            String message = "Logro desbloqueado: " + dto.getName() + " (" + dto.getMedalType() + ")";
            try {
                notificationService.createAchievementNotification(userId, message, userId);
            } catch (InstanceNotFoundException e) {
                // User should exist since validated earlier
            }
        }

        notificationService.createWorkoutLikeNotification(
                user.getId(),
                workout.getId()
        );

        return newAchievements;
    }

    @Override
    public void unlikeWorkout(Long userId, Long workoutId) {
        var like = workoutLikeDao.findByUserIdAndWorkoutId(userId, workoutId);
        if (like.isPresent()) {
            workoutLikeDao.delete(like.get());
            try {
                achievementProgressService.createOrUpdateAchievementProgress(userId, 6L, -1);
            } catch (InstanceNotFoundException e) {
                //
            }
        }
    }

    @Override
    public List<WorkoutLike> getLikesByUser(Long userId) {
        return workoutLikeDao.findByUserId(userId);
    }
}
