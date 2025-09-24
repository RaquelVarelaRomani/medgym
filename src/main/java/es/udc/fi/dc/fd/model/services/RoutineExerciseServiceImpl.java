package es.udc.fi.dc.fd.model.services;

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
    public RoutineExercise addExerciseToRoutine(Long userId, Long exerciseId, Long routineId, String description)
            throws InstanceNotFoundException, PermissionException {
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

        RoutineExercise routineExercise = new RoutineExercise(routine, exercise, description);
        return routineExerciseDao.save(routineExercise);
    }

    @Override
    public void removeExerciseFromRoutine(Long userId, Long id)
            throws InstanceNotFoundException, PermissionException {
        User user = permissionChecker.checkUser(userId);

        Optional<RoutineExercise> opRoutineExercise = routineExerciseDao.findById(id);

        if(opRoutineExercise.isEmpty()) {
            throw new InstanceNotFoundException("routineExercise", id);
        }

        RoutineExercise routineExercise = opRoutineExercise.get();

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routineExercise.getRoutine().getTrainer())) {
            throw new PermissionException();
        }

        routineExerciseDao.delete(routineExercise);
    }

    @Override
    public RoutineExercise updateExerciseOnRoutine(Long userId, Long id, Long exerciseId,
                                                   Long routineId, String description)
            throws InstanceNotFoundException, PermissionException {
        User user = permissionChecker.checkUser(userId);

        Optional<RoutineExercise> opRoutineExercise = routineExerciseDao.findById(id);

        if(opRoutineExercise.isEmpty()) {
            throw new InstanceNotFoundException("routineExercise", id);
        }

        RoutineExercise routineExercise = opRoutineExercise.get();

        if (user.getRole() != User.RoleType.ADMIN && !user.equals(routineExercise.getRoutine().getTrainer())) {
            throw new PermissionException();
        }

        routineExercise.setDescription(description);
        return routineExerciseDao.save(routineExercise);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoutineExercise> getExercisesForRoutines(Long routineId, Pageable pageable) {
        return routineExerciseDao.findByRoutineId(routineId, pageable);
    }

}
