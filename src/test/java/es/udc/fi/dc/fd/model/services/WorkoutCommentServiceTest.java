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
public class WorkoutCommentServiceTest {

    @Autowired
    private WorkoutCommentService workoutCommentService;

    @Autowired
    private WorkoutService workoutService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private RoutineService routineService;

    @Test
    public void testCommentWorkout() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User user = userDao.save(new User("u1", "n1", "u1@test.com", "600000001",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t1", "n2", "t1@test.com", "600000002",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        Routine routine = routineService.createRoutine("R1", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        workoutCommentService.commentWorkout(user.getId(), "Buen trabajo", workout.getId());

        List<WorkoutComment> comments = workoutCommentService.getWorkoutComments(workout.getId());
        assertEquals(1, comments.size());
        assertEquals("Buen trabajo", comments.get(0).getText());
        assertEquals(user.getId(), comments.get(0).getUser().getId());
        assertEquals(workout.getId(), comments.get(0).getWorkout().getId());
    }

    @Test
    public void testGetWorkoutCommentsMultiple() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User u1 = userDao.save(new User("u2", "n3", "u2@test.com", "600000003",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User u2 = userDao.save(new User("u3", "n4", "u3@test.com", "600000004",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t2", "n5", "t2@test.com", "600000005",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        Routine routine = routineService.createRoutine("R2", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, u1));

        workoutCommentService.commentWorkout(u1.getId(), "Comentario A", workout.getId());
        workoutCommentService.commentWorkout(u2.getId(), "Comentario B", workout.getId());

        List<WorkoutComment> comments = workoutCommentService.getWorkoutComments(workout.getId());
        assertEquals(2, comments.size());
        assertTrue(comments.stream().anyMatch(c -> c.getText().equals("Comentario A")));
        assertTrue(comments.stream().anyMatch(c -> c.getText().equals("Comentario B")));
    }

    @Test
    public void testDeleteWorkoutComment() throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        User user = userDao.save(new User("u4", "n6", "u4@test.com", "600000006",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("t3", "n7", "t3@test.com", "600000007",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        Routine routine = routineService.createRoutine("R3", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        workoutCommentService.commentWorkout(user.getId(), "Texto a borrar", workout.getId());

        List<WorkoutComment> comments = workoutCommentService.getWorkoutComments(workout.getId());
        assertEquals(1, comments.size());

        Long commentId = comments.get(0).getId();
        workoutCommentService.deleteWorkoutComment(commentId);

        assertTrue(workoutCommentService.getWorkoutComments(workout.getId()).isEmpty());
    }

    @Test
    public void testFindWorkoutCommentById() throws Exception {
        User user = userDao.save(new User("uX", "nX", "ux@test.com", "600000111",
                "pass", User.RoleType.CLIENT, User.StatusType.ACTIVE));

        User trainer = userDao.save(new User("tX", "nY", "tx@test.com", "600000222",
                "pass", User.RoleType.TRAINER, User.StatusType.ACTIVE));
        trainer.setTrainerPremium(true);

        Routine routine = routineService.createRoutine("RX", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Workout workout = workoutDao.save(new Workout(LocalDateTime.now(), null, routine, user));

        WorkoutComment created = workoutCommentService.commentWorkout(user.getId(), "Hola", workout.getId());

        WorkoutComment found = workoutCommentService.findWorkoutCommentById(created.getId());
        assertEquals(created.getId(), found.getId());
        assertEquals("Hola", found.getText());
    }

    @Test
    public void testFindWorkoutCommentByIdNotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                workoutCommentService.findWorkoutCommentById(-1L)
        );
    }
}
