package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Workout;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutService {
    Workout startWorkout(Long routineId, Long userId) throws InstanceNotFoundException;

    void finishWorkout(Long id) throws InstanceNotFoundException;

    Workout findWorkoutById(Long id) throws InstanceNotFoundException;

    List<Workout> findWorkoutsFromUser(Long userId);

    List<Workout> findWorkoutsFromFollowing(Long userId) throws InstanceNotFoundException;

    List<Workout> findWorkoutsByUserAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    List<Workout> getVolumeRankingForRoutine(Long routineId, Long userId) throws InstanceNotFoundException;

    int calculateCurrentStreak(Long userId);

    void remindStreak() throws InstanceNotFoundException;
}