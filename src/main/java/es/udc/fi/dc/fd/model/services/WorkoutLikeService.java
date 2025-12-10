package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.WorkoutLike;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;

import java.util.List;

public interface WorkoutLikeService {
    List<AchievementProgressDto> likeWorkout(Long userId, Long workoutId) throws InstanceNotFoundException;

    void unlikeWorkout(Long userId, Long workoutId);

    List<WorkoutLike> getLikesByUser(Long userId);
}
