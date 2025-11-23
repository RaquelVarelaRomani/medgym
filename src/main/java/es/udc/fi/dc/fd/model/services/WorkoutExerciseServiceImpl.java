package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WorkoutExerciseServiceImpl implements WorkoutExerciseService {
    private final WorkoutExerciseDao workoutExerciseDao;
    private final WorkoutDao workoutDao;
    private final RoutineExerciseDao routineExerciseDao;

    public WorkoutExerciseServiceImpl(WorkoutExerciseDao workoutExerciseDao, WorkoutDao workoutDao, RoutineExerciseDao routineExerciseDao) {
        this.workoutExerciseDao = workoutExerciseDao;
        this.workoutDao = workoutDao;
        this.routineExerciseDao = routineExerciseDao;
    }

    @Override
    public WorkoutExercise addWorkoutExercise(Short reps, Short weight, Short durationSeconds, Long workoutId, Long routineExerciseId) throws InstanceNotFoundException {
        return workoutExerciseDao.save(new WorkoutExercise(
                reps,
                weight,
                durationSeconds,
                workoutDao.findById(workoutId).orElseThrow(() -> new InstanceNotFoundException("project.entities.workout", workoutId)),
                routineExerciseDao.findById(routineExerciseId).orElseThrow(() -> new InstanceNotFoundException("project.entities.routineExercise", routineExerciseId))));
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
}
