package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class WrappedServiceImpl implements WrappedService {
    private final WorkoutDao workoutDao;
    private final WorkoutExerciseDao workoutExerciseDao;
    private final ExerciseDao exerciseDao;

    public WrappedServiceImpl(WorkoutDao workoutDao, WorkoutExerciseDao workoutExerciseDao, ExerciseDao exerciseDao) {
        this.workoutDao = workoutDao;
        this.workoutExerciseDao = workoutExerciseDao;
        this.exerciseDao = exerciseDao;
    }

    @Override
    public List<Exercise> getTopExercisesByUser(Long userId) {
        List<Long> workoutsId = workoutDao.findAllByUserId(userId).stream().map(Workout::getId).toList();
        List<WorkoutExercise> workoutExercises = workoutExerciseDao.findByWorkoutIdIn(workoutsId);
        Map<Long, Long> counts = workoutExercises.stream()
                .collect(Collectors.groupingBy(
                        we -> we.getRoutineExercise().getExercise().getId(),
                        Collectors.counting()
                ));
        return counts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(entry -> exerciseDao.findById(entry.getKey()).orElse(null))
                .filter(Objects::nonNull)
                .toList();
    }

    @Override
    public String getFavouriteMuscleGroup(Long userId) {
        List<Long> workoutIds = workoutDao.findAllByUserId(userId).stream()
                .map(Workout::getId).toList();
        List<WorkoutExercise> workoutExercises = workoutExerciseDao.findByWorkoutIdIn(workoutIds);

        return String.valueOf(workoutExercises.stream()
                .collect(Collectors.groupingBy(
                        we -> we.getRoutineExercise().getExercise().getMuscleGroup(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(Exercise.MuscleGroup.valueOf("")));
    }

    @Override
    public Routine getFavouriteRoutine(Long userId) {
        List<Workout> workouts = workoutDao.findAllByUserId(userId);

        Map<Routine, Long> counts = workouts.stream()
                .collect(Collectors.groupingBy(
                        Workout::getRoutine,
                        Collectors.counting()
                ));

        return counts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }
}
