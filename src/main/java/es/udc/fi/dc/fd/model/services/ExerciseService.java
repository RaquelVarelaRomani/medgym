package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;

public interface ExerciseService {
    Exercise createExercise(String name, String description, String muscleGroup, String equipment, byte[] image,  User user) throws DuplicateInstanceException;
    Exercise findExerciseById(Long exerciseId) throws InstanceNotFoundException;
    void updateExercise(Long exerciseId, String name, String description, String muscleGroup, String equipment, byte[] image) throws InstanceNotFoundException, DuplicateInstanceException;
    void updateExerciseStatus(Long exerciseId, Exercise.ExerciseStatus status) throws InstanceNotFoundException;
    List<Exercise> findAllExercises(Long userId) throws InstanceNotFoundException;
    List<Exercise> findExercisesWithPendingStatus();
    void deleteExercise(Long exerciseId) throws InstanceNotFoundException;
}
