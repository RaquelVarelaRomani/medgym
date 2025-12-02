package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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
                (int) ChronoUnit.SECONDS.between(workout.getStartTime(), workout.getEndTime()),
                workoutExercises.stream().mapToInt(WorkoutExercise::getReps).sum()
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

    @Override
    public int calculateCurrentStreak(Long userId) {
        List<Workout> workouts = workoutDao.findAllByUserId(userId).stream()
                .filter(w -> w.getEndTime() != null)
                .sorted((w1, w2) -> w2.getEndTime().toLocalDate().compareTo(w1.getEndTime().toLocalDate()))
                .toList();

        if (workouts.isEmpty()) {
            return 0;
        }

        Set<LocalDate> workoutDates = workouts.stream()
                .map(w -> w.getEndTime().toLocalDate())
                .collect(Collectors.toSet());

        List<LocalDate> sortedDates = workoutDates.stream()
                .sorted((d1, d2) -> d2.compareTo(d1))
                .toList();

        LocalDate today = LocalDate.now();
        LocalDate lastWorkoutDate = sortedDates.get(0);

        if (!lastWorkoutDate.equals(today) && !lastWorkoutDate.equals(today.minusDays(1))) {
            return 0;
        }

        int streak = 0;
        LocalDate currentDate = lastWorkoutDate;

        while (workoutDates.contains(currentDate)) {
            streak++;
            currentDate = currentDate.minusDays(1);
        }

        return streak;
    }
}
