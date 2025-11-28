package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class WorkoutServiceImpl implements WorkoutService {
    private final WorkoutDao workoutDao;
    private final RoutineDao routineDao;
    private final UserDao userDao;
    private final UserFollowDao userFollowDao;
    private final UserBlockService userBlockService;
    private final AchievementProgressService achievementProgressService;
    private final WorkoutExerciseDao workoutExerciseDao;

    public WorkoutServiceImpl(WorkoutDao workoutDao, RoutineDao routineDao, UserDao userDao, UserFollowDao userFollowDao, UserBlockService userBlockService, AchievementProgressService achievementProgressService, WorkoutExerciseDao workoutExerciseDao) {
        this.workoutDao = workoutDao;
        this.routineDao = routineDao;
        this.userDao = userDao;
        this.userFollowDao = userFollowDao;
        this.userBlockService = userBlockService;
        this.achievementProgressService = achievementProgressService;
        this.workoutExerciseDao = workoutExerciseDao;
    }

    @Override
    public Workout startWorkout(Long routineId, Long userId) throws InstanceNotFoundException {
        return workoutDao.save(new Workout(
                LocalDateTime.now(),
                null,
                routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException("project.entities.routine", routineId)),
                userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId))));
    }

    @Override
    public void finishWorkout(Long id) throws InstanceNotFoundException {
        final Workout workout = workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException("project.entities.workout", id));
        workout.setEndTime(LocalDateTime.now());

        List<WorkoutExercise> workoutExercises = workoutExerciseDao.findByWorkoutId(id);

        achievementProgressService.onFinishedWorkout(
                workout.getUser().getId(),
                (int) ChronoUnit.SECONDS.between(workout.getEndTime(), workout.getStartTime()),
                workoutExercises.stream().map(WorkoutExercise::getReps).toList().size()
        );
    }

    @Override
    public Workout findWorkoutById(Long id) throws InstanceNotFoundException {
        return workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException("project.entities.workout", id));
    }

    @Override
    public List<Workout> findWorkoutsFromUser(Long userId) {
        return workoutDao.findAllByUserId(userId);
    }

    @Override
    public List<Workout> findWorkoutsFromFollowing(Long userId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        List<Long> userFollowIds = userFollowDao.findByUser(user).stream().map(uf -> uf.getFollowUser().getId()).toList(); // mis seguidos

        return workoutDao.findAll().stream()
                .filter(w -> userFollowIds.contains(w.getUser().getId()))
                .filter(w -> !Objects.equals(w.getUser().getId(), userId))
                .filter(w -> w.getRoutine().getVisibility() == Routine.VisibilityType.PUBLIC)
                .filter(w -> w.getEndTime() != null)
                .filter(w -> !userBlockService.hasBlocked(w.getUser().getId(), userId)) //excluir workouts cuyos dueños me han bloqueado
                .toList();
    }

    @Override
    public List<Workout> findWorkoutsByUserAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return workoutDao.findByUserIdAndStartTimeBetweenAndEndTimeNotNull(userId, startDate, endDate);
    }
}
