package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WorkoutExerciseServiceImpl implements WorkoutExerciseService {

    @Autowired
    private WorkoutExerciseDao workoutExerciseDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

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
}
