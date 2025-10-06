package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RoutineServiceImpl implements RoutineService {

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserService userService;

    @Override
    public Routine createRoutine(String name, String description, User trainer) throws DuplicateInstanceException {
        if (routineDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.routine", name);
        }

        Routine routine = new Routine(name, description, trainer);
        return routineDao.save(routine);
    }

    @Override
    @Transactional(readOnly = true)
    public Routine findRoutineById(Long routineId) throws InstanceNotFoundException {
        return routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.routine", routineId));
    }

    @Override
    public void updateRoutine(Long userId, Long routineId, String name, String description) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        Routine routine = findRoutineById(routineId);
        User user = userService.loginFromId(userId);

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routine.getTrainer())) {
            throw new PermissionException();
        }

        if (!routine.getName().equals(name) && routineDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.routine", name);
        }

        routine.setName(name);
        routine.setDescription(description);
    }

    @Override
    public void deleteRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException {
        Routine routine = findRoutineById(routineId);
        User user = userService.loginFromId(userId);

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routine.getTrainer())) {
            throw new PermissionException();
        }

        routineDao.delete(routine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Routine> findAllRoutines() {
        return routineDao.findAll();
    }
}
