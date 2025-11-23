package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WorkoutLikeServiceTest {

    @Autowired
    private WorkoutLikeService workoutLikeService;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserDao userDao;

    @Test
    void testLikeWorkout() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User user = userDao.save(new User("u1", "s1", "u1@test.com", "600000001",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t1", "s2", "t1@test.com", "600000002",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine("R1", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        workoutLikeService.likeWorkout(user.getId(), workout.getId());

        List<WorkoutLike> likes = workoutLikeService.getLikesByUser(user.getId());
        assertEquals(1, likes.size());
        assertEquals(workout.getId(), likes.get(0).getWorkout().getId());
    }

    @Test
    void testGetLikesByUser() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User user = userDao.save(new User("u2", "s3", "u2@test.com", "600000003",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t2", "s4", "t2@test.com", "600000004",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine("R2", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout w1 = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));
        Workout w2 = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        workoutLikeService.likeWorkout(user.getId(), w1.getId());
        workoutLikeService.likeWorkout(user.getId(), w2.getId());

        List<WorkoutLike> likes = workoutLikeService.getLikesByUser(user.getId());
        assertEquals(2, likes.size());
    }

    @Test
    void testUnlikeWorkout() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User user = userDao.save(new User("u3", "s5", "u3@test.com", "600000005",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t3", "s6", "t3@test.com", "600000006",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine("R3", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        workoutLikeService.likeWorkout(user.getId(), workout.getId());
        assertEquals(1, workoutLikeService.getLikesByUser(user.getId()).size());

        workoutLikeService.unlikeWorkout(user.getId(), workout.getId());
        assertTrue(workoutLikeService.getLikesByUser(user.getId()).isEmpty());
    }

    @Test
    void testLikeWorkoutNonExistentWorkout() {
        User user = userDao.save(new User("u", "s", "u@test.com", "600000001",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        assertThrows(InstanceNotFoundException.class, () ->
                workoutLikeService.likeWorkout(user.getId(), 999L));
    }

    @Test
    void testDuplicateLikeDoesNotCreateDuplicates() throws Exception {
        User user = userDao.save(new User("u", "s", "u@test.com", "600000001",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t", "s", "t@test.com", "600000002",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine("R", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        workoutLikeService.likeWorkout(user.getId(), workout.getId());
        workoutLikeService.likeWorkout(user.getId(), workout.getId()); // duplicado

        List<WorkoutLike> likesForThisWorkout =
                workoutLikeService.getLikesByUser(user.getId()).stream()
                        .filter(l -> l.getWorkout().getId().equals(workout.getId()))
                        .toList();

        assertEquals(1, likesForThisWorkout.size());
        assertEquals(user.getId(), likesForThisWorkout.get(0).getUser().getId());
        assertEquals(workout.getId(), likesForThisWorkout.get(0).getWorkout().getId());
    }

    @Test
    void testUnlikeWorkoutWhenNotLikedDoesNothing() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User user = userDao.save(new User("u", "s", "u@test.com", "600000001",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t", "s", "t@test.com", "600000002",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine("R", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        assertDoesNotThrow(() -> workoutLikeService.unlikeWorkout(user.getId(), workout.getId()));
        assertTrue(workoutLikeService.getLikesByUser(user.getId()).isEmpty());
    }
}
