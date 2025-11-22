package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

public interface RoutineService {
    Routine createRoutine(String name, String description, User user, Routine.VisibilityType visibility, Routine.DifficultyType difficulty)
            throws DuplicateInstanceException, InstanceNotFoundException, PermissionException;
    Routine findRoutineById(Long routineId) throws InstanceNotFoundException;
    Routine findRoutineByIdAuth(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException;
    void updateRoutine(Long userId, Long routineId, String name, String description, Routine.VisibilityType visibility, Routine.DifficultyType difficulty)
            throws InstanceNotFoundException, DuplicateInstanceException, PermissionException;
    void deleteRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException;
    List<Routine> findAllRoutines(Long userId) throws InstanceNotFoundException;
    List<Routine> findRoutinesByFilters(Long userId, String equipment, String muscleGroup, Routine.DifficultyType difficulty, Long trainerId) throws InstanceNotFoundException;
}
