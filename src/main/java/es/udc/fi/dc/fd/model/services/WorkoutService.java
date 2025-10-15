package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Workout;

import java.util.List;

public interface WorkoutService {
    Workout startWorkout(Long routineId, Long userId) throws InstanceNotFoundException;
    void finishWorkout(Long id) throws InstanceNotFoundException;
    Workout findWorkoutById(Long id) throws InstanceNotFoundException;
    List<Workout> findWorkoutsFromUser(Long userId);
    void deleteWorkoutsByRoutine(Long routineId);
}