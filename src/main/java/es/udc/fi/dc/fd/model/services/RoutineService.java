package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import java.util.List;

public interface RoutineService {
    Routine createRoutine(String name, String description, User user) throws DuplicateInstanceException;
    Routine findRoutineById(Long routineId) throws InstanceNotFoundException;
    void updateRoutine(Long userId, Long routineId, String name, String description) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException;
    void deleteRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException;
    List<Routine> findAllRoutines();
}
