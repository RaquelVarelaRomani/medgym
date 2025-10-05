package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class RoutineExerciseServiceImpl implements RoutineExerciseService {
    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Override
    public RoutineExercise addExerciseToRoutine(Long userId, Long routineId, Long exerciseId, Integer position)
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        User user = permissionChecker.checkUser(userId);

        Optional<Routine> opRoutine = routineDao.findById(routineId);
        Optional<Exercise> opExercise = exerciseDao.findById(exerciseId);

        if(opExercise.isEmpty()) {
            throw new InstanceNotFoundException("exercise", exerciseId);
        }
        if(opRoutine.isEmpty()) {
            throw new InstanceNotFoundException("routine", routineId);
        }

        Routine routine = opRoutine.get();
        Exercise exercise = opExercise.get();

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routine.getTrainer())) {
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
        User user = permissionChecker.checkUser(userId);

        Optional<RoutineExercise> opRoutineExercise = routineExerciseDao.findByRoutineIdAndExerciseId(routineId, exerciseId);
        if(opRoutineExercise.isEmpty()) {
            throw new InstanceNotFoundException("routineExercise", "routine: " + routineId + ", exercise: " + exerciseId);
        }
        RoutineExercise routineExercise = opRoutineExercise.get();

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routineExercise.getRoutine().getTrainer())) {
            throw new PermissionException();
        }

        routineExerciseDao.delete(routineExercise);
    }

    @Override
    public RoutineExercise updateExerciseInRoutine(Long userId, Long routineId, Long exerciseId, Integer position)
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        User user = permissionChecker.checkUser(userId);

        Optional<RoutineExercise> opRoutineExercise = routineExerciseDao.findByRoutineIdAndExerciseId(routineId, exerciseId);
        if(opRoutineExercise.isEmpty()) {
            throw new InstanceNotFoundException("routineExercise", "routine: " + routineId + ", exercise: " + exerciseId);
        }
        RoutineExercise routineExercise = opRoutineExercise.get();

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routineExercise.getRoutine().getTrainer())) {
            throw new PermissionException();
        }

        // Note: Position duplicates are allowed in the database, so we don't validate them here
        // The application can handle position conflicts as needed

        routineExercise.setPosition(position);

        return routineExerciseDao.save(routineExercise);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoutineExercise> getExercisesForRoutines(Long routineId, Pageable pageable) {
        return routineExerciseDao.findByRoutineId(routineId, pageable);
    }

}
