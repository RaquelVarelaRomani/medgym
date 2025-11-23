package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.RoutineExerciseDao;
import es.udc.fi.dc.fd.model.entities.User;

import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;

@Service
@Transactional
public class ExerciseServiceImpl implements ExerciseService {
    private final ExerciseDao exerciseDao;
    private final PermissionChecker permissionChecker;
    private final RoutineExerciseDao routineExerciseDao;

    public ExerciseServiceImpl(ExerciseDao exerciseDao, PermissionChecker permissionChecker, RoutineExerciseDao routineExerciseDao) {
        this.exerciseDao = exerciseDao;
        this.permissionChecker = permissionChecker;
        this.routineExerciseDao = routineExerciseDao;
    }

    @Override
    public Exercise createExercise(String name, String description, MuscleGroup muscleGroup, Equipment equipment, byte[] image, User user) throws DuplicateInstanceException, PermissionException {
        if (exerciseDao.existsByName(name)) {
            throw new DuplicateInstanceException("project.entities.exercise", name);
        }

        Exercise.ExerciseStatus status;

        // Si el usuario es ADMIN → se aprueba directamente
        if (user.getRole() == User.RoleType.ADMIN) {
            status = Exercise.ExerciseStatus.APPROVED;
        } else if (user.getRole() == User.RoleType.TRAINER && Boolean.TRUE.equals(user.getTrainerPremium())) {
            status = ExerciseStatus.PENDING;
        } else {
            throw new PermissionException();
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
    public void updateExercise(Long exerciseId, String name, String description, MuscleGroup muscleGroup, Equipment equipment, byte[] image) throws InstanceNotFoundException, DuplicateInstanceException {
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
            List<Exercise> exercises1 = exerciseDao.findByStatusOrCreatorId(ExerciseStatus.APPROVED, userId);
            List<Exercise> exercises2 = exerciseDao.findByStatus(ExerciseStatus.BLOCKED);
            exercises2.addAll(exercises1);
            return exercises2;
        } else {
            List<Exercise> exercises1 = exerciseDao.findByStatus(ExerciseStatus.APPROVED);
            List<Exercise> exercises2 = exerciseDao.findByStatus(ExerciseStatus.BLOCKED);
            exercises2.addAll(exercises1);
            return exercises2;
        }
    }

    @Override
    public void deleteExercise(Long exerciseId) throws InstanceNotFoundException {
        Exercise exercise = findExerciseById(exerciseId);
        if (routineExerciseDao.existsByExerciseId(exerciseId)){
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,"No se puede borrar: el ejercicio está asociado a una o más rutinas."
            );
        }

        exerciseDao.delete(exercise);
    }

    @Override
    public List<MuscleGroup> findAllMuscleGroups() {
        return List.of(MuscleGroup.values());
    }

    @Override
    public List<Equipment> findAllEquipments() {
        return List.of(Equipment.values());
    }
}
