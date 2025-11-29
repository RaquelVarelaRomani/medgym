package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.WorkoutExercise;

import java.util.List;

public interface WorkoutExerciseService {
    WorkoutExercise addWorkoutExercise(Short reps, Short weight, Short durationSeconds, Long workoutId, Long routineExerciseId) throws InstanceNotFoundException;

    List<WorkoutExercise> findWorkoutExercisesByWorkoutId(Long workoutId) throws InstanceNotFoundException;

    List<WorkoutExercise> findWorkoutExercisesByWorkoutIds(List<Long> workoutIds);
}
