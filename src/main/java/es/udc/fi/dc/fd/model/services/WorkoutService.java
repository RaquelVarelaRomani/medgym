package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.Workout;

import java.util.List;

public interface WorkoutService {
    void startWorkout(Routine routine, User user);
    void finishWorkout(Long id);
    List<Workout> findWorkoutsFromUser(Long userId);
}