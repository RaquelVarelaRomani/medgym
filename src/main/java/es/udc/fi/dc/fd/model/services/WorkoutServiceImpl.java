package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final WorkoutExerciseService workoutExerciseService;

    private final String userInstance = "project.entities.user";
    private final String routineInstance = "project.entities.routine";
    private final String workoutInstance = "project.entities.workout";

    public WorkoutServiceImpl(WorkoutDao workoutDao, RoutineDao routineDao, UserDao userDao, UserFollowDao userFollowDao, UserBlockService userBlockService, WorkoutExerciseService workoutExerciseService) {
        this.workoutDao = workoutDao;
        this.routineDao = routineDao;
        this.userDao = userDao;
        this.userFollowDao = userFollowDao;
        this.userBlockService = userBlockService;
        this.workoutExerciseService = workoutExerciseService;
    }

    @Override
    public Workout startWorkout(Long routineId, Long userId) throws InstanceNotFoundException {
        return workoutDao.save(new Workout(
                LocalDateTime.now(),
                null,
                routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException(routineInstance, routineId)),
                userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(userInstance, userId))));
    }

    @Override
    public void finishWorkout(Long id) throws InstanceNotFoundException {
        final Workout workout = workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException(workoutInstance, id));
        workout.setEndTime(LocalDateTime.now());

        List<WorkoutExercise> exercises = workoutExerciseService.findWorkoutExercisesByWorkoutId(id);

        int totalVolume = exercises.stream()
                .filter(we -> we.getReps() != null && we.getWeight() != null)
                .mapToInt(we -> we.getReps() * we.getWeight())
                .sum();
        workout.setTotalVolume(totalVolume);
    }

    @Override
    public Workout findWorkoutById(Long id) throws InstanceNotFoundException {
        return workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException(workoutInstance, id));
    }

    @Override
    public List<Workout> findWorkoutsFromUser(Long userId) {
        return workoutDao.findAllByUserId(userId);
    }

    @Override
    public List<Workout> findWorkoutsFromFollowing(Long userId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(userInstance, userId));
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
    public List<Workout> getVolumeRankingForRoutine(Long routineId, Long userId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(userInstance, userId));
        List<Long> tmpUserFollowIds = userFollowDao.findByUser(user).stream().map(uf -> uf.getFollowUser().getId()).toList();
        List<Long> userFollowIds = new ArrayList<>(tmpUserFollowIds);
        userFollowIds.add(userId);

        List<Workout> workouts = workoutDao.findByRoutineIdAndUserIdIn(routineId, userFollowIds);
        return workouts.stream()
                .filter(w -> w.getEndTime() != null && w.getTotalVolume() != null)
                .sorted((a, b) -> b.getTotalVolume().compareTo(a.getTotalVolume()))
                .collect(Collectors.toList());
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
