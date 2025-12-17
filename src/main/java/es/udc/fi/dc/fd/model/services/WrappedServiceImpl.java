package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.rest.dtos.WeightComparisonDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class WrappedServiceImpl implements WrappedService {

    private final WorkoutDao workoutDao;
    private final WorkoutExerciseDao workoutExerciseDao;
    private final UserDao userDao;

    private static final String USER_INSTANCE = "project.entities.user";

    public WrappedServiceImpl(WorkoutDao workoutDao, WorkoutExerciseDao workoutExerciseDao, UserDao userDao) {
        this.workoutDao = workoutDao;
        this.workoutExerciseDao = workoutExerciseDao;
        this.userDao = userDao;
    }

    @Override
    public Long calculateYearlyTotalWeight(Long userId, int year) throws InstanceNotFoundException {
        userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(USER_INSTANCE, userId));

        LocalDateTime startOfYear = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime endOfYear = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        List<Workout> workouts = workoutDao.findByUserIdAndStartTimeBetweenAndEndTimeNotNull(userId, startOfYear,
                endOfYear);

        if (workouts.isEmpty()) {
            return 0L;
        }

        List<Long> workoutIds = workouts.stream().map(Workout::getId).toList();

        List<WorkoutExercise> exercises = workoutExerciseDao.findByWorkoutIdIn(workoutIds);

        return exercises.stream()
                .filter(we -> we.getWeight() != null && we.getReps() != null)
                .mapToLong(we -> (long) we.getWeight() * we.getReps())
                .sum();
    }

    @Override
    public WeightComparisonDto getWeightComparison(Long userId, int year) throws InstanceNotFoundException {
        Long totalWeightKg = calculateYearlyTotalWeight(userId, year);

        String comparisonPhrase = generateComparisonPhrase(totalWeightKg);

        return new WeightComparisonDto(totalWeightKg, comparisonPhrase);
    }

    private String generateComparisonPhrase(Long totalWeightKg) {
        if (totalWeightKg == null || totalWeightKg == 0) {
            return "¡Aún no has levantado peso este año! ¡Empieza tu viaje fitness!";
        }

        WeightReference bestMatch = WeightReference.findBestMatch(totalWeightKg);
        double ratio = WeightReference.calculateRatio(totalWeightKg, bestMatch);

        String formattedRatio;
        if (ratio >= 10) {
            formattedRatio = String.format("%.0f", ratio);
        } else {
            formattedRatio = String.format("%.1f", ratio);
        }

        if (ratio < 1.1) {
            return String.format("un %s", bestMatch.getName());
        } else {
            String plural = makePlural(bestMatch.getName());
            return String.format("%s %s", formattedRatio, plural);
        }
    }

    private String makePlural(String name) {
        if (name.endsWith("ón")) {
            return name.substring(0, name.length() - 2) + "ones";
        } else if (name.endsWith("z")) {
            return name.substring(0, name.length() - 1) + "ces";
        } else if (name.endsWith("s") || name.endsWith("x")) {
            return name;
        } else if (name.endsWith("a") || name.endsWith("e") || name.endsWith("i") || name.endsWith("o")
                || name.endsWith("u")) {
            return name + "s";
        } else {
            return name + "es";
        }
    }

    @Override
    public Integer getLongestStreak(Long userId, int year) throws InstanceNotFoundException {
        userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException(USER_INSTANCE, userId));

        LocalDateTime startOfYear = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime endOfYear = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        List<Workout> workouts = workoutDao.findByUserIdAndStartTimeBetweenAndEndTimeNotNull(userId, startOfYear,
                endOfYear);

        if (workouts.isEmpty()) {
            return 0;
        }

        List<java.time.LocalDate> workoutDates = workouts.stream()
                .map(w -> w.getStartTime().toLocalDate())
                .distinct()
                .sorted()
                .toList();

        int longestStreak = 1;
        int currentStreak = 1;

        for (int i = 1; i < workoutDates.size(); i++) {
            if (workoutDates.get(i).minusDays(1).equals(workoutDates.get(i - 1))) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return longestStreak;
    }
}
