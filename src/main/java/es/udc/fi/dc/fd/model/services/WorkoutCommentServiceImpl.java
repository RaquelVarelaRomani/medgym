package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.WorkoutComment;
import es.udc.fi.dc.fd.model.entities.WorkoutCommentDao;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class WorkoutCommentServiceImpl implements WorkoutCommentService {
    private final WorkoutCommentDao workoutCommentDao;
    private final UserDao userDao;
    private final WorkoutDao workoutDao;
    private final NotificationService notificationService;
    private final AchievementProgressService achievementProgressService;

    private static final ThreadLocal<List<AchievementProgressDto>> newAchievementsThreadLocal = new ThreadLocal<>();

    public WorkoutCommentServiceImpl(WorkoutCommentDao workoutCommentDao, UserDao userDao, WorkoutDao workoutDao, NotificationService notificationService, AchievementProgressService achievementProgressService) {
        this.workoutCommentDao = workoutCommentDao;
        this.userDao = userDao;
        this.workoutDao = workoutDao;
        this.notificationService = notificationService;
        this.achievementProgressService = achievementProgressService;
    }

    @Override
    public WorkoutComment findWorkoutCommentById(Long workoutCommentId) throws InstanceNotFoundException {
        return workoutCommentDao.findById(workoutCommentId).orElseThrow(() -> new InstanceNotFoundException("entities.workoutComment", workoutCommentId));
    }

    @Override
    public WorkoutComment commentWorkout(Long userId, String text, Long workoutId) throws InstanceNotFoundException {
        var user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("entities.user", userId));
        var workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("entities.workout", workoutId));

        WorkoutComment workoutComment = new WorkoutComment(
                text,
                LocalDateTime.now(),
                workout,
                user
        );

        var newAchievements = achievementProgressService.createOrUpdateAchievementProgress(userId, 7L, 1);
        newAchievementsThreadLocal.set(newAchievements);

        notificationService.createWorkoutCommentNotification(
                userId,
                text,
                workoutId
        );

        return workoutCommentDao.save(workoutComment);
    }

    @Override
    public void deleteWorkoutComment(Long workoutCommentId) throws InstanceNotFoundException {
        var comment = workoutCommentDao.findById(workoutCommentId).orElseThrow(() -> new InstanceNotFoundException("entities.workoutComment", workoutCommentId));
        User user = comment.getUser();
        achievementProgressService.createOrUpdateAchievementProgress(user.getId(), 7L, -1);
        workoutCommentDao.delete(comment);
    }

    @Override
    public List<WorkoutComment> getWorkoutComments(Long workoutId) {
        return workoutCommentDao.findByWorkoutId(workoutId);
    }

    public List<AchievementProgressDto> getNewAchievements() {
        return newAchievementsThreadLocal.get();
    }

    public void clearNewAchievements() {
        newAchievementsThreadLocal.remove();
    }
}
