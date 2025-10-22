package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RoutineLikeServiceTest {

    @Autowired
    private RoutineLikeService routineLikeService;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private RoutineLikeDao routineLikeDao;

    @Test
    public void testLikeRoutine() throws InstanceNotFoundException, DuplicateInstanceException {
        User user = userDao.save(new User("u1", "n1", "u1@test.com", "600000001",
                "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("t1", "n2", "t1@test.com", "600000002",
                "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine(
                "Rutina A", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineLikeService.likeRoutine(user.getId(), routine.getId());

        List<RoutineLike> likes = routineLikeService.getLikesByUser(user.getId());
        assertEquals(1, likes.size());
        assertEquals(routine.getId(), likes.get(0).getRoutine().getId());
    }

    @Test
    public void testGetLikesByUser() throws InstanceNotFoundException, DuplicateInstanceException {
        User user = userDao.save(new User("u2", "n3", "u2@test.com", "600000003",
                "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("t2", "n4", "t2@test.com", "600000004",
                "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine r1 = routineService.createRoutine("Rutina 1", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        Routine r2 = routineService.createRoutine("Rutina 2", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.INTERMEDIATE);

        routineLikeService.likeRoutine(user.getId(), r1.getId());
        routineLikeService.likeRoutine(user.getId(), r2.getId());

        List<RoutineLike> likes = routineLikeService.getLikesByUser(user.getId());
        assertEquals(2, likes.size());
        assertTrue(likes.stream().anyMatch(l -> l.getRoutine().getId().equals(r1.getId())));
        assertTrue(likes.stream().anyMatch(l -> l.getRoutine().getId().equals(r2.getId())));
    }

    @Test
    public void testUnlikeRoutine() throws InstanceNotFoundException, DuplicateInstanceException {
        User user = userDao.save(new User("u3", "n5", "u3@test.com", "600000005",
                "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("t3", "n6", "t3@test.com", "600000006",
                "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine(
                "Rutina B", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineLikeService.likeRoutine(user.getId(), routine.getId());
        assertEquals(1, routineLikeService.getLikesByUser(user.getId()).size());

        routineLikeService.unlikeRoutine(user.getId(), routine.getId());
        assertTrue(routineLikeService.getLikesByUser(user.getId()).isEmpty());
    }
}
