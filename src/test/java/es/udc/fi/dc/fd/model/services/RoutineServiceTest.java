package es.udc.fi.dc.fd.model.services;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RoutineServiceTest {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RoutineLikeService routineLikeService;

    @Autowired
    private UserFollowService userFollowService;

    private User createUser(String name) {
        User u = new User(
                name,
                "surname",
                name + "@mail.com",
                "600",
                "password",
                null,
                RoleType.CLIENT,
                User.StatusType.ACTIVE
        );
        return userDao.save(u);
    }

    private User createTrainerPremium(String name) {
        User u = new User(
                name,
                "surname",
                name + "@mail.com",
                "601",
                "password",
                null,
                RoleType.TRAINER,
                User.StatusType.ACTIVE
        );
        u.setTrainerPremium(true);
        return userDao.save(u);
    }

    private User createTrainerNonPremium(String name) {
        User u = new User(
                name,
                "surname",
                name + "@mail.com",
                "602",
                "password",
                null,
                RoleType.TRAINER,
                User.StatusType.ACTIVE
        );
        u.setTrainerPremium(false);
        return userDao.save(u);
    }

    @Test
    public void testCreateAndFindRoutine() throws Exception {
        User user = createTrainerPremium("u1");
        Routine routine = routineService.createRoutine(
                "r1", "d", user,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER
        );

        Routine found = routineService.findRoutineByIdAuth(user.getId(), routine.getId());

        assertEquals(routine, found);
    }

    @Test
    public void testCreateDuplicateRoutine() throws Exception {
        User user = createTrainerPremium("u2");
        routineService.createRoutine("rx", "d", user,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        assertThrows(DuplicateInstanceException.class, () ->
                routineService.createRoutine("rx", "d", user,
                        Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER));
    }

    @Test
    public void testUpdateRoutine() throws Exception {
        User user = createTrainerPremium("u3");
        Routine routine = routineService.createRoutine(
                "ru", "d", user,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER
        );

        routineService.updateRoutine(user.getId(), routine.getId(),
                "new", "desc",
                Routine.VisibilityType.PUBLIC,
                Routine.DifficultyType.INTERMEDIATE
        );

        Routine updated = routineService.findRoutineByIdAuth(user.getId(), routine.getId());

        assertEquals("new", updated.getName());
        assertEquals("desc", updated.getDescription());
        assertEquals(Routine.DifficultyType.INTERMEDIATE, updated.getDifficulty());
    }

    @Test
    public void testUpdateRoutineDuplicateName() throws Exception {
        User user = createTrainerPremium("u4");
        routineService.createRoutine("a1", "d", user,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Routine r2 = routineService.createRoutine("a2", "d", user,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        assertThrows(DuplicateInstanceException.class, () ->
                routineService.updateRoutine(user.getId(), r2.getId(), "a1",
                        "d", Routine.VisibilityType.PUBLIC,
                        Routine.DifficultyType.BEGINNER));
    }

    @Test
    public void testUpdateRoutineWithoutPermission() throws Exception {
        User trainer = createTrainerPremium("trainerX");
        User client = createUser("clientX");

        Routine routine = routineService.createRoutine(
                "test", "d", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER
        );

        assertThrows(PermissionException.class, () ->
                routineService.updateRoutine(client.getId(), routine.getId(),
                        "x", "y",
                        Routine.VisibilityType.PUBLIC,
                        Routine.DifficultyType.BEGINNER));
    }

    @Test
    public void testDeleteRoutine() throws Exception {
        User user = createTrainerPremium("u6");
        Routine routine = routineService.createRoutine(
                "del", "d", user,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER
        );

        routineService.deleteRoutine(user.getId(), routine.getId());

        assertThrows(InstanceNotFoundException.class, () ->
                routineService.findRoutineByIdAuth(user.getId(), routine.getId()));
    }

    @Test
    public void testDeleteRoutineWithoutPermission() throws Exception {
        User trainer = createTrainerPremium("trainerY");
        User client = createUser("clientY");

        Routine routine = routineService.createRoutine(
                "rr", "d", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER
        );

        assertThrows(PermissionException.class, () ->
                routineService.deleteRoutine(client.getId(), routine.getId()));
    }

    @Test
    public void testGetAllRoutines() throws Exception {
        User user = createTrainerPremium("owner");
        User user2 = createTrainerNonPremium("other");
        user2.setTrainerPremium(true);

        int initialUser = routineService.findAllRoutines(user.getId()).size();
        int initialUser2 = routineService.findAllRoutines(user2.getId()).size();

        routineService.createRoutine("r1", "d", user,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineService.createRoutine("r2", "d", user,
                Routine.VisibilityType.PRIVATE, Routine.DifficultyType.BEGINNER);

        assertEquals(initialUser + 2, routineService.findAllRoutines(user.getId()).size());
        assertEquals(initialUser2 + 1, routineService.findAllRoutines(user2.getId()).size());
    }

    @Test
    public void testGetRoutine_permissionDeniedOnDeleteByOtherUser() throws Exception {
        User owner = createTrainerPremium("u10");

        Routine created = routineService.createRoutine(
                "RRR", "d", owner,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        // Usuario distinto, existente
        User other = createTrainerNonPremium("u11");
        other.setTrainerPremium(true);

        assertThrows(PermissionException.class, () ->
                routineService.deleteRoutine(other.getId(), created.getId()));
    }

    @Test
    public void testDeleteRoutineCascadesNotifications() throws Exception {
        User trainer = createTrainerPremium("trainerZ");
        User client = createUser("clientZ");

        userFollowService.followUser(client.getId(), trainer.getId());

        Routine routine = routineService.createRoutine("T1", "d",
                trainer, Routine.VisibilityType.PUBLIC,
                Routine.DifficultyType.BEGINNER);

        routineLikeService.likeRoutine(client.getId(), routine.getId());

        routineService.deleteRoutine(trainer.getId(), routine.getId());

        List<Notification> trainerNotifications =
                notificationService.getNotificationsByUser(trainer.getId());
        List<Notification> clientNotifications =
                notificationService.getNotificationsByUser(client.getId());

        assertTrue(trainerNotifications.stream()
                .noneMatch(n -> routine.getId().equals(n.getIdToRedirect())));

        assertTrue(clientNotifications.stream()
                .noneMatch(n -> routine.getId().equals(n.getIdToRedirect())));
    }

    @Test
    public void testFindRoutineByIdNonExistent() {
        assertThrows(InstanceNotFoundException.class, () ->
                routineService.findRoutineById(999L));
    }

    @Test
    public void testFindRoutinesByFilters() throws Exception {
        User trainer = createTrainerPremium("filterT");

        Routine r1 = routineService.createRoutine(
                "FX1", "d", trainer,
                Routine.VisibilityType.PUBLIC,
                Routine.DifficultyType.BEGINNER);

        Routine r2 = routineService.createRoutine(
                "FX2", "d", trainer,
                Routine.VisibilityType.PUBLIC,
                Routine.DifficultyType.INTERMEDIATE);

        User client = createUser("filterClient");

        List<Routine> filtered = routineService.findRoutinesByFilters(
                client.getId(),
                null,
                null,
                Routine.DifficultyType.INTERMEDIATE,
                trainer.getId()
        );

        assertEquals(1, filtered.size());
        assertEquals(r2.getId(), filtered.get(0).getId());
    }

    @Test
    public void testPremiumTrainerUnlimitedRoutines() throws Exception {
        User trainer = createTrainerPremium("prUnlimited");

        for (int i = 1; i <= 10; i++) {
            routineService.createRoutine("RU" + i, "d", trainer,
                    Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        }

        long count = routineDao.findAll().stream()
                .filter(r -> r.getTrainer().equals(trainer))
                .count();

        assertEquals(10, count);
    }

    @Test
    public void testNonPremiumTrainerLimit() throws Exception {
        User trainer = createTrainerNonPremium("np1");

        for (int i = 0; i < 3; i++) {
            routineService.createRoutine("RU" + i, "d", trainer,
                    Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        }

        assertThrows(PermissionException.class, () ->
                routineService.createRoutine("C", "d", trainer,
                        Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER));
    }
}
