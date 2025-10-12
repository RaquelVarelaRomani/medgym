package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import java.util.List;

public interface RoutineService {
    Routine createRoutine(String name, String description, User trainer, Routine.VisibilityType visibility)
            throws DuplicateInstanceException, InstanceNotFoundException;
    Routine findRoutineById(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException;
    void updateRoutine(Long userId, Long routineId, String name, String description, Routine.VisibilityType visibility)
            throws InstanceNotFoundException, DuplicateInstanceException, PermissionException;
    void deleteRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException;
    List<Routine> findAllRoutines(Long userId) throws InstanceNotFoundException;
}
