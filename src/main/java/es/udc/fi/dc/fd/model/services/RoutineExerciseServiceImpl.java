package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectRoutineExerciseValuesException;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
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
    public void addExerciseToRoutine(Long userId, Long exerciseId, Long routineId, Byte repetitionsNumber, Short duration)
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

        if (user.equals(routine.getTrainer())) {
            throw new PermissionException();
        }

        if (!isValidRepetitionsAndDuration(repetitionsNumber, duration)) {
            throw new IncorrectRoutineExerciseValuesException();
        }

        RoutineExercise routineExercise = new RoutineExercise(routine, exercise, repetitionsNumber, duration);
        routineExerciseDao.save(routineExercise);
    }

    @Override
    public void removeExerciseFromRoutine(Long userId, Long exerciseId, Long routineId)
            throws InstanceNotFoundException, PermissionException {
        User user = permissionChecker.checkUser(userId);

        Optional<RoutineExercise> opRoutineExercise =
                routineExerciseDao.findByRoutineIdAndExerciseId(routineId, exerciseId);

        if(opRoutineExercise.isEmpty()) {
            throw new InstanceNotFoundException("exercise", exerciseId);
        }

        RoutineExercise routineExercise = opRoutineExercise.get();

        if (user.equals(routineExercise.getRoutine().getTrainer())) {
            throw new PermissionException();
        }

        routineExerciseDao.delete(routineExercise);
    }

    @Override
    public void updateExerciseOnRoutine(Long userId, Long exerciseId, Long routineId, Byte repetitionsNumber, Short duration)
            throws InstanceNotFoundException, PermissionException {
        User user = permissionChecker.checkUser(userId);

        Optional<RoutineExercise> opRoutineExercise =
                routineExerciseDao.findByRoutineIdAndExerciseId(routineId, exerciseId);

        if(opRoutineExercise.isEmpty()) {
            throw new InstanceNotFoundException("exercise", exerciseId);
        }

        if (!isValidRepetitionsAndDuration(repetitionsNumber, duration)) {
            throw new IncorrectRoutineExerciseValuesException();
        }

        RoutineExercise routineExercise = opRoutineExercise.get();
        routineExercise.setRepetitionsNumber(repetitionsNumber);
        routineExercise.setDuration(duration);
        routineExerciseDao.save(routineExercise);
    }

    @Override
    @Transactional(readOnly = true)
    public Block<RoutineExercise> getExercisesForRoutines(Long routineId, int page, int size) {
        Slice<RoutineExercise> slice = routineExerciseDao.findByRoutineId(routineId, PageRequest.of(page, size));
        return new Block<>(slice.getContent(), slice.hasNext());
    }

    /**
     * Check if they have valid values.
     *
     * @param repetitionsNumber the repetition number
     * @param duration the duration on seconds
     * @return true if they have valid values, false in other case
     */
    private boolean isValidRepetitionsAndDuration(Byte repetitionsNumber, Short duration){
        if (repetitionsNumber == null) {
            return duration != null && duration >= 0;
        }

        if (duration == null) {
            return repetitionsNumber >= 0;
        }

        return false;
    }
}
