package es.udc.fi.dc.fd.model.services;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Workout;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
import jakarta.transaction.Transactional;

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
        user = new User("Name", "Surname", "user@example.com", "1234567890", "1234", null, RoleType.TRAINER, User.StatusType.ACTIVE);
        user.setName("Name");
        user.setEmail("user@example.com");
        user.setPhoneNumber("1234567890");
        user.setPassword("1234");
        user = userDao.save(user);

        routine = new Routine("Name", "Description", VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        routine.setName("Morning Routine");
        routine = routineDao.save(routine);
    }


    @Test
    public void testStartWorkoutcreatesWorkout() {
        List<Workout> workoutsBefore = workoutDao.findAll();
        Workout workout = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));

        assertNotNull(workout.getId());
        assertNotNull(workout.getStartTime());
        assertNull(workout.getEndTime());
        assertEquals(user.getId(), workout.getUser().getId());
        assertEquals(routine.getId(), workout.getRoutine().getId());

        List<Workout> workoutsAfter = workoutDao.findAll();
        assertEquals(workoutsBefore.size() + 1, workoutsAfter.size());
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
    public void testFindWorkoutsByUserAndDateRangeReturnsWorkouts(){
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeHoursAgo = now.minusHours(3);
        LocalDateTime twoHoursAgo = now.minusHours(2);
        LocalDateTime oneHourAgo = now.minusHours(1);


        Workout w1 = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));
        w1.setStartTime(twoHoursAgo);
        w1.setEndTime(oneHourAgo);
        assertDoesNotThrow(() -> workoutService.finishWorkout(w1.getId()));

        Workout w2 = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));
        w2.setStartTime(oneHourAgo);
        w2.setEndTime(now);
        assertDoesNotThrow(() -> workoutService.finishWorkout(w2.getId()));

        LocalDateTime startRange = threeHoursAgo.plusMinutes(1);
        LocalDateTime endRange = now.minusSeconds(1);

        List<Workout> workouts = workoutService.findWorkoutsByUserAndDateRange(user.getId(), startRange, endRange);
        assertEquals(2, workouts.size());
        assertTrue(workouts.stream().allMatch(w -> w.getUser().getId().equals(user.getId())));
        assertTrue(workouts.stream().allMatch(w -> w.getEndTime() != null));
    }

    @Test
    public void testFindWorkoutsByUserAndDateRangeEmptyList(){
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startRange = now.minusHours(2);
        LocalDateTime endRange = now.minusHours(1);

        List<Workout> workouts = workoutService.findWorkoutsByUserAndDateRange(user.getId(), startRange, endRange);
        assertTrue(workouts.isEmpty());
    }

    @Test
    public void testFindWorkoutsByUserAndDateRangeExcludesIncompleteWorkouts(){
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startRange = now.minusHours(3);

        Workout completedWorkout = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));
        completedWorkout.setStartTime(now.minusHours(1));
        completedWorkout.setEndTime(now);
        assertDoesNotThrow(() -> workoutService.finishWorkout(completedWorkout.getId()));

        Workout incompleteWorkout = assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));
        incompleteWorkout.setStartTime(now.minusHours(2));

        List<Workout> workouts = workoutService.findWorkoutsByUserAndDateRange(user.getId(), startRange, now);
        assertEquals(1, workouts.size());
        assertNotNull(workouts.get(0).getEndTime());
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
