package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WorkoutLikeServiceImpl implements WorkoutLikeService {

    @Autowired
    private WorkoutLikeDao workoutLikeDao;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private UserDao userDao;

    @Override
    public void likeWorkout(Long userId, Long workoutId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("entities.user", userId));
        Workout workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("entities.workout", workoutId));

        if (getLikesByUser(userId).stream().anyMatch(w -> w.getWorkout().getId().equals(workoutId))) {
            return;
        }

        WorkoutLike workoutLike = new WorkoutLike(
                workout,
                user
        );
        workoutLikeDao.save(workoutLike);

        notificationService.createWorkoutLikeNotification(
                user.getId(),
                workout.getId()
        );
    }

    @Override
    public void unlikeWorkout(Long userId, Long workoutId) {
        workoutLikeDao.deleteByUserIdAndWorkoutId(userId, workoutId);
    }

    @Override
    public List<WorkoutLike> getLikesByUser(Long userId) {
        return workoutLikeDao.findByUserId(userId);
    }
}
