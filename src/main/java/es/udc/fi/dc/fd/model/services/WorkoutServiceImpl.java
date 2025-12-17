package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
    private final NotificationService notificationService;
    private final WorkoutExerciseService workoutExerciseService;
    private final WorkoutExerciseDao workoutExerciseDao;
    private final ExerciseMaxWeightService exerciseMaxWeightService;

    private static final String USER_INSTANCE = "project.entities.user";
    private static final String ROUTINE_INSTANCE = "project.entities.routine";
    private static final String WORKOUT_INSTANCE = "project.entities.workout";
    public WorkoutServiceImpl(WorkoutDao workoutDao, RoutineDao routineDao, UserDao userDao, UserFollowDao userFollowDao, UserBlockService userBlockService, NotificationService notificationService, WorkoutExerciseService workoutExerciseService, WorkoutExerciseDao workoutExerciseDao, ExerciseMaxWeightService exerciseMaxWeightService) {
        this.workoutDao = workoutDao;
        this.routineDao = routineDao;
        this.userDao = userDao;
        this.userFollowDao = userFollowDao;
        this.userBlockService = userBlockService;
        this.notificationService = notificationService;
        this.workoutExerciseService = workoutExerciseService;
        this.workoutExerciseDao = workoutExerciseDao;
        this.exerciseMaxWeightService = exerciseMaxWeightService;
    }

    @Override
    public Workout startWorkout(Long routineId, Long userId) throws InstanceNotFoundException {
        return workoutDao.save(new Workout(
                LocalDateTime.now(),
                null,
                routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException(ROUTINE_INSTANCE, routineId)),
                userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(USER_INSTANCE, userId))));
    }

    @Override
    public void finishWorkout(Long id) throws InstanceNotFoundException {
        final Workout workout = workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException(WORKOUT_INSTANCE, id));
        workout.setEndTime(LocalDateTime.now());

        List<WorkoutExercise> exercises = workoutExerciseService.findWorkoutExercisesByWorkoutId(id);
        int totalVolume = exercises.stream()
                .filter(we -> we.getReps() != null && we.getWeight() != null)
                .mapToInt(we -> we.getReps() * we.getWeight())
                .sum();
        workout.setTotalVolume(totalVolume);

        List<WorkoutExercise> workoutExercises = workoutExerciseDao.findByWorkoutId(id);

        for (WorkoutExercise workoutExercise : workoutExercises) {
            exerciseMaxWeightService.addOrUpdateMaxWeight(workout.getUser().getId(), workoutExercise.getRoutineExercise().getExercise().getId(), workoutExercise.getWeight());
        }

        checkRankingSurpass(workout);
    }

    @Override
    public Workout findWorkoutById(Long id) throws InstanceNotFoundException {
        return workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException(WORKOUT_INSTANCE, id));
    }

    @Override
    public List<Workout> findWorkoutsFromUser(Long userId) {
        return workoutDao.findAllByUserId(userId);
    }

    @Override
    public List<Workout> findWorkoutsFromFollowing(Long userId) throws InstanceNotFoundException {
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(USER_INSTANCE, userId));
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
        User user = userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(USER_INSTANCE, userId));
        List<Long> tmpUserFollowIds = userFollowDao.findByUser(user).stream().map(uf -> uf.getFollowUser().getId()).toList();
        List<Long> userFollowIds = new ArrayList<>(tmpUserFollowIds);
        userFollowIds.add(userId);

        List<Workout> workouts = workoutDao.findByRoutineIdAndUserIdIn(routineId, userFollowIds);
        return workouts.stream()
                .filter(w -> w.getEndTime() != null && w.getTotalVolume() != null)
                .sorted((a, b) -> b.getTotalVolume().compareTo(a.getTotalVolume()))
                .toList();
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

    @Override
    public boolean trainedToday(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        return workoutDao.findByUserIdAndStartTimeBetweenAndEndTimeNotNull(userId, startOfDay, endOfDay)
                .stream().anyMatch(w -> w.getEndTime() != null);
    }

    @Override
    @Scheduled(cron = "0 0 9 * * ?")
    public void remindStreak() throws InstanceNotFoundException {
        List<User> users = userDao.findAll();
        for (User user : users) {
            int currentStreak = calculateCurrentStreak(user.getId());
            if (currentStreak > 1) {
                notificationService.createStreakRemindNotification(user.getId(), currentStreak);
            }
        }
    }

    private void checkRankingSurpass(Workout workout) throws InstanceNotFoundException {
        Long userId = workout.getUser().getId();
        Long routineId = workout.getRoutine().getId();

        // 1. Retrieve followers and create user IDs list.
        List<Long> followerIds = userFollowDao.findByFollowUser(workout.getUser()).stream()
                .map(uf -> uf.getUser().getId())
                .toList();

        if (followerIds.isEmpty()) {
            return;
        }

        List<Long> userIds = new ArrayList<>(followerIds);
        userIds.add(userId);

        // 2. Query workouts excluding the current one, filter valid, group by user for previous max volumes.
        List<Workout> previousWorkouts = workoutDao.findByRoutineIdAndUserIdIn(routineId, userIds).stream()
                .filter(w -> !w.getId().equals(workout.getId()))
                .filter(w -> w.getEndTime() != null && w.getTotalVolume() != null)
                .toList();

        Map<Long, Optional<Double>> previousMaxVolumes = previousWorkouts.stream()
                .collect(Collectors.groupingBy(w -> w.getUser().getId(),
                        Collectors.mapping(w -> w.getTotalVolume().doubleValue(), Collectors.maxBy(Double::compare))));

        Map<Long, Double> previousMaxVolumesWithDefaults = new HashMap<>();
        for (Long uid : userIds) {
            previousMaxVolumesWithDefaults.put(uid, previousMaxVolumes.getOrDefault(uid, Optional.of(0.0)).orElse(0.0));
        }

        // 3. Sort users by previous max descending, find previous position.
        List<Long> previousRanking = previousMaxVolumesWithDefaults.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .toList();

        int previousPosition = previousRanking.indexOf(userId);

        // 4. Include the current workout, recalculate max volumes.
        Map<Long, Double> newMaxVolumes = new HashMap<>(previousMaxVolumesWithDefaults);
        double currentVolume = workout.getTotalVolume();
        double prevMaxForUser = previousMaxVolumesWithDefaults.get(userId);
        if (currentVolume > prevMaxForUser) {
            newMaxVolumes.put(userId, currentVolume);
        }

        // 5. Sort users by new max descending, find new position.
        List<Long> newRanking = newMaxVolumes.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .toList();

        int newPosition = newRanking.indexOf(userId);

        // 6. If new position < previous position, notify users from new position + 1 to previous position who are followers.
        if (newPosition < previousPosition) {
            for (int i = newPosition + 1; i <= previousPosition; i++) {
                Long surpassedUserId = newRanking.get(i);
                if (followerIds.contains(surpassedUserId)) {
                    notificationService.createRankingSurpassNotification(surpassedUserId, userId, routineId);
                }
            }
        }
    }

}
