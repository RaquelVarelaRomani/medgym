package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.WorkoutComment;
import es.udc.fi.dc.fd.model.entities.WorkoutLike;

import java.util.List;

public interface WorkoutCommentService {
    WorkoutComment findWorkoutCommentById(Long workoutCommentId) throws InstanceNotFoundException;
    WorkoutComment commentWorkout(Long userId, String text, Long workoutId) throws InstanceNotFoundException;
    void deleteWorkoutComment(Long workoutCommentId);
    List<WorkoutComment> getWorkoutComments(Long workoutId);
}
