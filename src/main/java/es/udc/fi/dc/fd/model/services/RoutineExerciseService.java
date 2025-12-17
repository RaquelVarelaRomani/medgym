package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoutineExerciseService {
    RoutineExercise addExerciseToRoutine(Long userId, Long routineId, Long exerciseId, RoutineExercise.ExerciseType exerciseType, Integer position)
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException;

    void removeExerciseFromRoutine(Long userId, Long routineId, Long exerciseId)
            throws InstanceNotFoundException, PermissionException;

    RoutineExercise updateExerciseInRoutine(Long userId, Long routineId, Long exerciseId, Integer position)
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException;

    Page<RoutineExercise> getExercisesForRoutines(Long routineId, Pageable pageable);

    List<RoutineExercise.ExerciseType> findAllExerciseTypes();
}
