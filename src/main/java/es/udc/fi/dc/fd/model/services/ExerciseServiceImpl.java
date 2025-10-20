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
    public Exercise createExercise(String name, String description, String muscleGroup, String equipment, byte[] image, User user) throws DuplicateInstanceException {
        if (exerciseDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.exercise", name);
        }

        Exercise.ExerciseStatus status;

        // Si el usuario es ADMIN → se aprueba directamente
        if (user.getRole() == User.RoleType.ADMIN) {
            status = Exercise.ExerciseStatus.APPROVED;
        } else {
            // Si es entrenador → pendiente de aprobación
            status = Exercise.ExerciseStatus.PENDING;
        }
        
        Exercise exercise = new Exercise(name, description, muscleGroup, equipment, image, status, user);
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
    public void updateExercise(Long exerciseId, String name, String description, String muscleGroup, String equipment, byte[] image) throws InstanceNotFoundException, DuplicateInstanceException {
        Exercise exercise = findExerciseById(exerciseId);

        if (!exercise.getName().equals(name) && exerciseDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.exercise", name);
        }

        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setMuscleGroup(muscleGroup);
        exercise.setEquipment(equipment);
        exercise.setImage(image);
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

        if (user.getRole() == User.RoleType.ADMIN) {
            return exerciseDao.findAll();
        } else if (user.getRole() == User.RoleType.TRAINER) {
            return exerciseDao.findByStatusOrCreatorId(ExerciseStatus.APPROVED, userId);
        } else {
            return exerciseDao.findByStatus(ExerciseStatus.APPROVED);
        }
    }

    @Override
    public void deleteExercise(Long exerciseId) throws InstanceNotFoundException {
        Exercise exercise = findExerciseById(exerciseId);
        exerciseDao.delete(exercise);
    }
}
