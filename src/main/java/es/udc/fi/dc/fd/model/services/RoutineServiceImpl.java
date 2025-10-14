package es.udc.fi.dc.fd.model.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

@Service
@Transactional
public class RoutineServiceImpl implements RoutineService {

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Routine createRoutine(String name, String description, User trainer, Routine.VisibilityType visibility, Routine.DifficultyType difficulty) throws DuplicateInstanceException, InstanceNotFoundException {
        if (routineDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.routine", name);
        }

        Routine routine = new Routine(name, description, visibility, difficulty, trainer);

        notificationService.createNotification(routine);
        return routineDao.save(routine);
    }

    @Override
    @Transactional(readOnly = true)
    public Routine findRoutineById(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException {
        Optional<Routine> opRoutine = routineDao.findById(routineId);

        if (opRoutine.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.routine", routineId);
        }

        User user = userService.loginFromId(userId);
        Routine routine = opRoutine.get();

        if (user.getRole() != User.RoleType.ADMIN && userId != routine.getTrainer().getId() &&
                routine.getVisibility() == Routine.VisibilityType.PRIVATE) {
            throw new PermissionException();
        }

        return routine;
    }

    @Override
    public void updateRoutine(Long userId, Long routineId, String name, String description, Routine.VisibilityType visibility, Routine.DifficultyType difficulty)
            throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        Routine routine = findRoutineById(userId, routineId);
        User user = userService.loginFromId(userId);

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routine.getTrainer())) {
            throw new PermissionException();
        }

        if (!routine.getName().equals(name) && routineDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.routine", name);
        }

        routine.setName(name);
        routine.setDescription(description);
        routine.setVisibility(visibility);
        routine.setDifficulty(difficulty);
    }

    @Override
    public void deleteRoutine(Long userId, Long routineId) throws InstanceNotFoundException, PermissionException {
        Routine routine = findRoutineById(userId, routineId);
        User user = userService.loginFromId(userId);

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routine.getTrainer())) {
            throw new PermissionException();
        }

        routineDao.delete(routine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Routine> findAllRoutines(Long userId) throws InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        List<Routine> routines = routineDao.findAll();

        if (user.getRole() == User.RoleType.ADMIN) {
            return routines;
        }

        return routines.stream().filter(routine -> !routine.isPrivate() || routine.getTrainer().equals(user))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Routine> findRoutinesByFilters(Long userId, String muscleGroup, Routine.DifficultyType difficulty, Long trainerId) throws InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        List<Routine> routines = routineDao.findAll();

        // Filter by visibility
        if (user.getRole() != User.RoleType.ADMIN) {
            routines = routines.stream()
                    .filter(routine -> !routine.isPrivate() || routine.getTrainer().equals(user))
                    .collect(Collectors.toList());
        }

        // Filter by muscle group if provided
        if (muscleGroup != null && !muscleGroup.trim().isEmpty()) {
            List<Routine> muscleGroupRoutines = routineDao.findByMuscleGroup(muscleGroup);
            routines = routines.stream()
                    .filter(muscleGroupRoutines::contains)
                    .collect(Collectors.toList());
        }

        // Filter by difficulty if provided
        if (difficulty != null) {
            routines = routines.stream()
                    .filter(routine -> routine.getDifficulty() == difficulty)
                    .collect(Collectors.toList());
        }

        // Filter by trainer if provided
        if (trainerId != null) {
            routines = routines.stream()
                    .filter(routine -> routine.getTrainer().getId().equals(trainerId))
                    .collect(Collectors.toList());
        }

        return routines;
    }
}
