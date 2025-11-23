package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.WorkoutComment;
import es.udc.fi.dc.fd.model.entities.WorkoutCommentDao;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
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

    public WorkoutCommentServiceImpl(WorkoutCommentDao workoutCommentDao, UserDao userDao, WorkoutDao workoutDao, NotificationService notificationService) {
        this.workoutCommentDao = workoutCommentDao;
        this.userDao = userDao;
        this.workoutDao = workoutDao;
        this.notificationService = notificationService;
    }

    @Override
    public WorkoutComment findWorkoutCommentById(Long workoutCommentId) throws InstanceNotFoundException {
        return workoutCommentDao.findById(workoutCommentId).orElseThrow(() -> new InstanceNotFoundException("entities.workoutComment", workoutCommentId));
    }

    @Override
    public WorkoutComment commentWorkout(Long userId, String text, Long workoutId) throws InstanceNotFoundException {
        WorkoutComment workoutComment = new WorkoutComment(
                text,
                LocalDateTime.now(),
                workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("entities.workout", workoutId)),
                userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("entities.user", userId))
        );

        notificationService.createWorkoutCommentNotification(
                userId,
                text,
                workoutId
        );

        return workoutCommentDao.save(workoutComment);
    }

    @Override
    public void deleteWorkoutComment(Long workoutCommentId) {
        workoutCommentDao.deleteById(workoutCommentId);
    }

    @Override
    public List<WorkoutComment> getWorkoutComments(Long workoutId) {
        return workoutCommentDao.findByWorkoutId(workoutId);
    }
}
