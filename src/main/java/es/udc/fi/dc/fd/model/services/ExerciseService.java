package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;

import java.util.List;

public interface ExerciseService {
    Exercise createExercise(String name, String description, User user) throws DuplicateInstanceException;
    Exercise findExerciseById(Long exerciseId) throws InstanceNotFoundException;
    void updateExercise(Long exerciseId, String name, String description) throws InstanceNotFoundException, DuplicateInstanceException;
    void updateExerciseStatus(Long exerciseId, Exercise.ExerciseStatus status) throws InstanceNotFoundException;
    List<Exercise> findAllExercises();
    List<Exercise> findExercisesWithPendingStatus();
    void deleteExercise(Long exerciseId) throws InstanceNotFoundException;
}
