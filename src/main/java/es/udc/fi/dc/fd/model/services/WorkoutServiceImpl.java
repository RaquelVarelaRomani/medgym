package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class WorkoutServiceImpl implements WorkoutService {

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserDao userDao;

    @Override
    public Workout startWorkout(Long routineId, Long userId) throws InstanceNotFoundException {
        return workoutDao.save(new Workout(
                LocalDateTime.now(),
                null,
                routineDao.findById(routineId).orElseThrow(() -> new InstanceNotFoundException("project.entities.routine", routineId)),
                userDao.findById(userId).orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId))));
    }

    @Override
    public void finishWorkout(Long id) throws InstanceNotFoundException {
        final Workout workout = workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException("project.entities.workout", id));
        workout.setEndTime(LocalDateTime.now());
        workoutDao.save(workout);
    }

    @Override
    public Workout findWorkoutById(Long id) throws InstanceNotFoundException {
        return workoutDao.findById(id).orElseThrow(() -> new InstanceNotFoundException("project.entities.workout", id));
    }

    @Override
    public List<Workout> findWorkoutsFromUser(Long userId) {
        return workoutDao.findAllByUserId(userId);
    }

    @Override
    public List<Workout> findWorkoutsFromFollowing(Long userId) {
        return workoutDao.findAll().stream()
                .filter(w -> !Objects.equals(w.getUser().getId(), userId))
                .filter(w -> w.getRoutine().getVisibility() == Routine.VisibilityType.PUBLIC)
                .toList();
    }
}
