package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

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
    @Autowired
    private UserFollowService userFollowService;
    @Autowired
    private RoutineService routineService;

    @BeforeEach
    void setUp() {
        user = new User("Name", "Surname", "user@example.com", "1234567890", "1234", RoleType.TRAINER, User.StatusType.ACTIVE);
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
        assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));
        assertDoesNotThrow(() -> workoutService.startWorkout(routine.getId(), user.getId()));

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

    @Test
    public void testStartWorkoutNonExistentRoutine() {
        User user1 = userDao.save(new User("u", "n", "u@test.com", "600", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        assertThrows(InstanceNotFoundException.class, () ->
                workoutService.startWorkout(999L, user1.getId())
        );
    }

    @Test
    public void testStartWorkoutCreatesWorkout() throws Exception {
        User trainer = userDao.save(new User("t", "n", "t@test.com", "601", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        User client = userDao.save(new User("c", "n", "c@test.com", "602", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        Routine routine1 = routineService.createRoutine("R", "d", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout w = workoutService.startWorkout(routine1.getId(), client.getId());

        assertNotNull(w.getId());
        assertNotNull(w.getStartTime());
        assertNull(w.getEndTime());
        assertEquals(client.getId(), w.getUser().getId());
        assertEquals(routine1.getId(), w.getRoutine().getId());
    }

    @Test
    public void testFinishWorkout() throws Exception {
        User trainer = userDao.save(new User("t2", "n", "t2@test.com", "603", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        User client = userDao.save(new User("c2", "n", "c2@test.com", "604", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        Routine routine1 = routineService.createRoutine("R2", "d2", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        Workout w = workoutService.startWorkout(routine1.getId(), client.getId());

        workoutService.finishWorkout(w.getId());

        Workout finished = workoutService.findWorkoutById(w.getId());
        assertNotNull(finished.getEndTime());
    }

    @Test
    public void testFinishWorkoutNonExistent() {
        assertThrows(InstanceNotFoundException.class, () -> workoutService.finishWorkout(999L));
    }

    @Test
    public void testFindWorkoutsFromUser() throws Exception {
        User trainer = userDao.save(new User("t3", "n", "t3@test.com", "605", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        User client = userDao.save(new User("c3", "n", "c3@test.com", "606", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        Routine routine1 = routineService.createRoutine("R3", "d3", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        workoutService.startWorkout(routine1.getId(), client.getId());
        List<Workout> list = workoutService.findWorkoutsFromUser(client.getId());

        assertEquals(1, list.size());
        assertEquals(client.getId(), list.get(0).getUser().getId());
    }

    @Test
    public void testFindWorkoutsFromFollowing() throws Exception {
        User trainer = userDao.save(new User("tf", "n", "tf@test.com", "607", "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        User client1 = userDao.save(new User("cf1", "n", "cf1@test.com", "608", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User client2 = userDao.save(new User("cf2", "n", "cf2@test.com", "609", "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        userFollowService.followUser(client1.getId(), trainer.getId());

        Routine routine1 = routineService.createRoutine("RF", "dF", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        workoutService.startWorkout(routine1.getId(), client2.getId());

        List<Workout> list = workoutService.findWorkoutsFromFollowing(client1.getId());

        assertEquals(0, list.size());
    }
}
