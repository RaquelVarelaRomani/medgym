package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class RoutineExerciseServiceImpl implements RoutineExerciseService {
    private final PermissionChecker permissionChecker;
    private final RoutineExerciseDao routineExerciseDao;
    private final RoutineExerciseService routineExerciseService;
    private final RoutineDao routineDao;
    private final ExerciseDao exerciseDao;

    public RoutineExerciseServiceImpl(PermissionChecker permissionChecker, RoutineExerciseDao routineExerciseDao, @Lazy RoutineExerciseService routineExercise, RoutineDao routineDao, ExerciseDao exerciseDao) {
        this.permissionChecker = permissionChecker;
        this.routineExerciseDao = routineExerciseDao;
        this.routineExerciseService = routineExercise;
        this.routineDao = routineDao;
        this.exerciseDao = exerciseDao;
    }

    @Override
    public RoutineExercise addExerciseToRoutine(Long userId, Long routineId, Long exerciseId, Integer position)
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        User user = permissionChecker.checkUser(userId);

        Optional<Routine> opRoutine = routineDao.findById(routineId);
        Optional<Exercise> opExercise = exerciseDao.findById(exerciseId);

        int nExercises = routineExerciseService.getExercisesForRoutines(routineId, PageRequest.of(0, 4)).getSize();

        if (opExercise.isEmpty()) {
            throw new InstanceNotFoundException("exercise", exerciseId);
        }
        if (opRoutine.isEmpty()) {
            throw new InstanceNotFoundException("routine", routineId);
        }

        Routine routine = opRoutine.get();
        Exercise exercise = opExercise.get();

        if (!(
                user.getRole() == User.RoleType.ADMIN || ( // admin
                        user.equals(routine.getTrainer()) && ( // trainer who matches routine trainer
                                (user.getRole() == User.RoleType.TRAINER && user.getTrainerPremium()) || // trainer premium
                                        (user.getRole() == User.RoleType.TRAINER && !user.getTrainerPremium() && nExercises < 5) // trainer not premium with less than 5 exercises
                        )
                )
        )) {
            throw new PermissionException();
        }

        if (routineExerciseDao.existsByRoutineIdAndExerciseId(routineId, exerciseId)) {
            throw new DuplicateInstanceException("routineExercise", "routine: " + routineId + ", exercise: " + exerciseId);
        }

        // Note: Position duplicates are allowed in the database, so we don't validate them here
        // The application can handle position conflicts as needed

        RoutineExercise routineExercise = new RoutineExercise(routine, exercise, position);
        return routineExerciseDao.save(routineExercise);
    }

    @Override
    public void removeExerciseFromRoutine(Long userId, Long routineId, Long exerciseId)
            throws InstanceNotFoundException, PermissionException {
        RoutineExercise routineExercise = this.getRoutineExercise(userId, routineId, exerciseId);
        routineExerciseDao.delete(routineExercise);
    }

    @Override
    public RoutineExercise updateExerciseInRoutine(Long userId, Long routineId, Long exerciseId, Integer position)
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        RoutineExercise routineExercise = this.getRoutineExercise(userId, routineId, exerciseId);
        routineExercise.setPosition(position);

        return routineExerciseDao.save(routineExercise);
    }

    private RoutineExercise getRoutineExercise(Long userId, Long routineId, Long exerciseId) throws InstanceNotFoundException, PermissionException {
        User user = permissionChecker.checkUser(userId);

        Optional<RoutineExercise> opRoutineExercise = routineExerciseDao.findByRoutineIdAndExerciseId(routineId, exerciseId);
        if (opRoutineExercise.isEmpty()) {
            throw new InstanceNotFoundException("routineExercise", "routine: " + routineId + ", exercise: " + exerciseId);
        }
        RoutineExercise routineExercise = opRoutineExercise.get();

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routineExercise.getRoutine().getTrainer())) {
            throw new PermissionException();
        }
        return routineExercise;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoutineExercise> getExercisesForRoutines(Long routineId, Pageable pageable) {
        return routineExerciseDao.findByRoutineId(routineId, pageable);
    }

}
