package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

public interface RoutineExerciseService {
    void addExerciseToRoutine(Long userId, Long exerciseId, Long routineId, Byte repetitionsNumber, Short duration)
            throws InstanceNotFoundException, PermissionException;
    void removeExerciseFromRoutine(Long userId,Long exerciseId, Long routineId)
            throws InstanceNotFoundException, PermissionException;
    void updateExerciseOnRoutine(Long userId, Long exerciseId, Long routineId, Byte repetitionsNumber, Short duration)
            throws InstanceNotFoundException, PermissionException;
    Block<RoutineExercise> getExercisesForRoutines(Long routineId, int page, int size);
}
