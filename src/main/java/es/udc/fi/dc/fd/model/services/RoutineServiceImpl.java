package es.udc.fi.dc.fd.model.services;

import java.util.*;
import java.util.stream.Collectors;

import es.udc.fi.dc.fd.model.entities.Exercise;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineLikeDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

@Service
@Transactional
public class RoutineServiceImpl implements RoutineService {
    private final RoutineDao routineDao;
    private final UserService userService;
    private final NotificationService notificationService;
    private final RoutineLikeDao routineLikeDao;

    public RoutineServiceImpl(RoutineDao routineDao, UserService userService, NotificationService notificationService, RoutineLikeDao routineLikeDao) {
        this.routineDao = routineDao;
        this.userService = userService;
        this.notificationService = notificationService;
        this.routineLikeDao = routineLikeDao;
    }

    @Override
    public Routine createRoutine(String name, String description, User user, Routine.VisibilityType visibility, Routine.DifficultyType difficulty) throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        if (routineDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.routine", name);
        }

        int nRoutines = routineDao.findByTrainerId(user.getId()).size();

        if (!(
                user.getRole() == User.RoleType.ADMIN || // admin
                (user.getRole() == User.RoleType.TRAINER && user.getTrainerPremium()) || // trainer premium
                (user.getRole() == User.RoleType.TRAINER && !user.getTrainerPremium() && nRoutines < 3) // trainer not premium with less than 3 routines
        )) {
            throw new PermissionException();
        }

        Routine routine = new Routine(name, description, visibility, difficulty, user);

        routine = routineDao.save(routine);

        notificationService.createNewRoutineNotification(routine.getId());

        return routine;
    }

    @Override
    public Routine findRoutineById(Long routineId) throws InstanceNotFoundException {
        return routineDao.findById(routineId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.routine", routineId));
    }

    @Override
    @Transactional(readOnly = true)
    public Routine findRoutineByIdAuth(Long userId, Long routineId)
            throws InstanceNotFoundException, PermissionException {
        Optional<Routine> opRoutine = routineDao.findById(routineId);

        if (opRoutine.isEmpty()) {
            throw new InstanceNotFoundException("project.entities.routine", routineId);
        }

        User user = userService.loginFromId(userId);
        Routine routine = opRoutine.get();

        if (user.getRole() != User.RoleType.ADMIN && !Objects.equals(userId, routine.getTrainer().getId()) &&
                routine.getVisibility() == Routine.VisibilityType.PRIVATE) {
            throw new PermissionException();
        }

        return routine;
    }

    @Override
    public void updateRoutine(Long userId, Long routineId, String name, String description,
            Routine.VisibilityType visibility, Routine.DifficultyType difficulty)
            throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        Routine routine = findRoutineByIdAuth(userId, routineId);
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
        Routine routine = findRoutineByIdAuth(userId, routineId);
        User user = userService.loginFromId(userId);

        if (user.getRole() != User.RoleType.ADMIN && !Objects.equals(user.getId(), routine.getTrainer().getId())) {
            throw new PermissionException();
        }

        notificationService.deleteNotificationsByIdToRedirect(routineId);
        routineLikeDao.deleteByRoutineId(routineId);

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
    public List<Routine> findRoutinesByFilters(Long userId, String equipment, String muscleGroup,
            Routine.DifficultyType difficulty, Long trainerId) throws InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        List<Routine> routines = routineDao.findAll();

        // Filter by visibility
        if (user.getRole() != User.RoleType.ADMIN) {
            routines = routines.stream()
                    .filter(routine -> !routine.isPrivate() || routine.getTrainer().equals(user))
                    .collect(Collectors.toList());
        }

        // Filter by equipment if provided (multi-select)
        if (equipment != null && !equipment.trim().isEmpty()) {
            String[] equipmentList = equipment.split(",");
            Set<Routine> equipmentRoutines = new HashSet<>();

            for (String equip : equipmentList) {
                equipmentRoutines.addAll(routineDao.findByEquipment(Exercise.Equipment.valueOf(equip.trim())));
            }

            routines = routines.stream()
                    .filter(equipmentRoutines::contains)
                    .collect(Collectors.toList());
        }

        // Filter by muscle group if provided
        if (muscleGroup != null && !muscleGroup.trim().isEmpty()) {
            String[] muscleGroupList = muscleGroup.split(",");
            Set<Routine> muscleGroupRoutines = new HashSet<>();

            for (String group : muscleGroupList) {
                muscleGroupRoutines.addAll(routineDao.findByMuscleGroup(Exercise.MuscleGroup.valueOf(group.trim())));
            }

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
