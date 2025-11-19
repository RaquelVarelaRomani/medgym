package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;

import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;

public interface ExerciseService {
    Exercise createExercise(String name, String description, MuscleGroup muscleGroup, Equipment equipment, byte[] image,  User user) throws DuplicateInstanceException, PermissionException;
    Exercise findExerciseById(Long exerciseId) throws InstanceNotFoundException;
    void updateExercise(Long exerciseId, String name, String description, MuscleGroup muscleGroup, Equipment equipment, byte[] image) throws InstanceNotFoundException, DuplicateInstanceException;
    void updateExerciseStatus(Long exerciseId, Exercise.ExerciseStatus status) throws InstanceNotFoundException;
    List<Exercise> findAllExercises(Long userId) throws InstanceNotFoundException;
    List<Exercise> findExercisesWithPendingStatus();
    void deleteExercise(Long exerciseId) throws InstanceNotFoundException;
    List<MuscleGroup> findAllMuscleGroups();
    List<Equipment> findAllEquipments();
}
