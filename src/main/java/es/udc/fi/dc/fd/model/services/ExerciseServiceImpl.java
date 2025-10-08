package es.udc.fi.dc.fd.model.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.User;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Override
    public Exercise createExercise(String name, String description, User user) throws DuplicateInstanceException {
        if (exerciseDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.exercise", name);
        }

        Exercise exercise = new Exercise(name, description, ExerciseStatus.PENDING, user);
        return exerciseDao.save(exercise);
    }

    @Override
    @Transactional(readOnly = true)
    public Exercise findExerciseById(Long exerciseId) throws InstanceNotFoundException {
        return exerciseDao.findById(exerciseId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.exercise", exerciseId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Exercise> findExercisesWithPendingStatus() {
        return exerciseDao.findByStatus(ExerciseStatus.PENDING);
    }

    @Override
    public void updateExercise(Long exerciseId, String name, String description) throws InstanceNotFoundException, DuplicateInstanceException {
        Exercise exercise = findExerciseById(exerciseId);

        if (!exercise.getName().equals(name) && exerciseDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.exercise", name);
        }

        exercise.setName(name);
        exercise.setDescription(description);
    }

    @Override
    public void updateExerciseStatus(Long exerciseId, Exercise.ExerciseStatus status) throws InstanceNotFoundException {
        Exercise exercise = findExerciseById(exerciseId);
        exercise.setStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Exercise> findAllExercises(Long userId) throws InstanceNotFoundException {
        User user = permissionChecker.checkUser(userId);

        return switch (user.getRole()) {
            case ADMIN -> exerciseDao.findAll();
            case TRAINER -> exerciseDao.findByStatusOrCreatorId(ExerciseStatus.APPROVED, userId);
            case CLIENT -> exerciseDao.findByStatus(ExerciseStatus.APPROVED);
        };
    }

    @Override
    public void deleteExercise(Long exerciseId) throws InstanceNotFoundException {
        Exercise exercise = findExerciseById(exerciseId);
        exerciseDao.delete(exercise);
    }
}
