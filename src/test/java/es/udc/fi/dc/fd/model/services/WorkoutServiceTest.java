package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static es.udc.fi.dc.fd.model.entities.User.RoleType;
import static es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class WorkoutServiceTest {

    @Autowired
    WorkoutService workoutService;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    WorkoutDao workoutDao;

    private User user;
    private Routine routine;

    @BeforeEach
    void setUp() {
        user = new User("Name", "Surname", "user@example.com", "1234567890", "1234", null, RoleType.TRAINER);
        user.setName("Name");
        user.setEmail("user@example.com");
        user.setPhoneNumber("1234567890");
        user.setPassword("1234");
        user = userDao.save(user);

        routine = new Routine("Name", "Description", VisibilityType.PUBLIC, user);
        routine.setName("Morning Routine");
        routine = routineDao.save(routine);
    }


    @Test
    public void testStartWorkoutcreatesWorkout() {
        Workout workout = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));

        assertNotNull(workout.getId());
        assertNotNull(workout.getStartTime());
        assertNull(workout.getEndTime());
        assertEquals(user.getId(), workout.getUser().getId());
        assertEquals(routine.getId(), workout.getRoutine().getId());

        List<Workout> workouts = workoutDao.findAll();
        assertEquals(14, workouts.size());
        assertEquals(workout.getId(), workouts.get(0).getId() + 19);
    }

    @Test
    public void testFinishWorkoutsetsEndTime() {
        Workout workout = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));
        assertNull(workout.getEndTime());

        assertDoesNotThrow(() -> workoutService.finishWorkout(workout.getId()));

        Workout updated = workoutDao.findById(workout.getId()).orElseThrow();
        assertNotNull(updated.getEndTime());
        assertTrue(updated.getEndTime().isAfter(updated.getStartTime()));
    }

    @Test
    public void testFindWorkoutByIdReturnsWorkout() throws InstanceNotFoundException {
        // Arrange
        Workout workout = workoutService.startWorkout(routine.getId(), user.getId());

        // Act
        Workout found = workoutService.findWorkoutById(workout.getId());

        // Assert
        assertNotNull(found);
        assertEquals(workout.getId(), found.getId());
        assertEquals(workout.getUser().getId(), found.getUser().getId());
        assertEquals(workout.getRoutine().getId(), found.getRoutine().getId());
        assertNotNull(found.getStartTime());
        assertNull(found.getEndTime());
    }

    @Test
    public void testFindWorkoutByIdNonexistentThrows() {
        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> workoutService.findWorkoutById(999L));
    }

    @Test
    public void testFindWorkoutsFromUserreturnsWorkouts() {
        Workout w1 = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));
        Workout w2 = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));

        List<Workout> workouts = workoutService.findWorkoutsFromUser(user.getId());

        assertEquals(2, workouts.size());
        assertTrue(workouts.stream().allMatch(w -> w.getUser().getId().equals(user.getId())));
    }

    @Test
    public void testFindWorkoutsFromUseremptyList() {
        List<Workout> workouts = workoutService.findWorkoutsFromUser(user.getId());
        assertTrue(workouts.isEmpty());
    }

    @Test
    public void testFinishWorkoutnonexistentIdthrows() {
        assertThrows(InstanceNotFoundException.class,
                () -> workoutService.finishWorkout(999L));
    }

    @Test
    public void testStartWorkoutnonexistentRoutinethrows() {
        assertThrows(InstanceNotFoundException.class,
                () -> workoutService.startWorkout(999L, user.getId()));
    }

    @Test
    public void testStartWorkoutnonexistentUserthrows() {
        assertThrows(InstanceNotFoundException.class,
                () -> workoutService.startWorkout(routine.getId(), 999L));
    }
}
