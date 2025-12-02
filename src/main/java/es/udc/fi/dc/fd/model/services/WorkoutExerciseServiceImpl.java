package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WorkoutExerciseServiceImpl implements WorkoutExerciseService {
    private final WorkoutExerciseDao workoutExerciseDao;
    private final WorkoutDao workoutDao;
    private final RoutineExerciseDao routineExerciseDao;
    private AchievementProgressService achievementProgressService;

    public WorkoutExerciseServiceImpl(WorkoutExerciseDao workoutExerciseDao, WorkoutDao workoutDao, RoutineExerciseDao routineExerciseDao) {
        this.workoutExerciseDao = workoutExerciseDao;
        this.workoutDao = workoutDao;
        this.routineExerciseDao = routineExerciseDao;
    }

    @Override
    public WorkoutExercise addWorkoutExercise(Short reps, Short weight, Short durationSeconds, Long workoutId, Long routineExerciseId) throws InstanceNotFoundException {
        Optional<Workout> opWorkout = workoutDao.findById(workoutId);
        if (opWorkout.isPresent()) {
            Workout workout = opWorkout.get();
            Long userId = workout.getUser().getId();
            if (weight > findMaxWeightByUser(userId)) {
                achievementProgressService.maxWeightWorkout(userId, weight);
            }
            return workoutExerciseDao.save(new WorkoutExercise(
                    reps,
                    weight,
                    durationSeconds,
                    workout,
                    routineExerciseDao.findById(routineExerciseId).orElseThrow(() -> new InstanceNotFoundException("project.entities.routineExercise", routineExerciseId))));
        }

        throw new InstanceNotFoundException("project.entities.workout", workoutId);
    }

    @Override
    public List<WorkoutExercise> findWorkoutExercisesByWorkoutId(Long workoutId) throws InstanceNotFoundException {
        final Workout workout = workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("project.entities.workout", workoutId));
        return workoutExerciseDao.findByWorkoutId(workout.getId());
    }

    @Override
    public List<WorkoutExercise> findWorkoutExercisesByWorkoutIds(List<Long> workoutIds) {
        return workoutExerciseDao.findByWorkoutIdIn(workoutIds);
    }

    private Integer findMaxWeightByUser(Long userId) {
        List<Workout> workouts = workoutDao.findAllByUserId(userId);
        List<WorkoutExercise> workoutExercises =
                findWorkoutExercisesByWorkoutIds( workouts.stream().map(Workout::getId).toList());
        Integer maxWeight = 0;
        for (WorkoutExercise we : workoutExercises) {
            if (we.getWeight() != null && we.getWeight() > maxWeight) {
                maxWeight = Integer.valueOf(we.getWeight());
            }
        }
        return maxWeight;
    }
}
