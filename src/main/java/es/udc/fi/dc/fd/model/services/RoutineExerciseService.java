package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoutineExerciseService {
    RoutineExercise addExerciseToRoutine(Long userId, Long routineId, Long exerciseId)
            throws InstanceNotFoundException, PermissionException;

    void removeExerciseFromRoutine(Long userId, Long routineId, Long exerciseId)
            throws InstanceNotFoundException, PermissionException;

    Page<RoutineExercise> getExercisesForRoutines(Long routineId, Pageable pageable);
}
