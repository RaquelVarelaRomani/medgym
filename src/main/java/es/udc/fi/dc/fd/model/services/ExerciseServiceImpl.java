package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {

    @Autowired
    private ExerciseDao exerciseDao;

    @Override
    public Exercise createExercise(String name, String description, User user) throws DuplicateInstanceException {
        if (exerciseDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.exercise", name);
        }

        Exercise exercise = new Exercise(name, description, ExerciseStatus.PENDING);
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
    public List<Exercise> findAllExercises() {
        return exerciseDao.findAll();
    }

    @Override
    public void deleteExercise(Long exerciseId) throws InstanceNotFoundException {
        Exercise exercise = findExerciseById(exerciseId);
        exerciseDao.delete(exercise);
    }
}
