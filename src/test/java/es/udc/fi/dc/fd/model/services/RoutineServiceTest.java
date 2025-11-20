
package es.udc.fi.dc.fd.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

import java.util.List;

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

    private User createUser(String userName) {
        User user = new User(userName, "password", userName + "@test.com", userName, "email@test.com", null, RoleType.CLIENT, User.StatusType.ACTIVE);
        return userDao.save(user);
    }

    @Test
    public void testCreateAndFindRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user@test.com");
        Routine routine = routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        Routine foundRoutine = routineService.findRoutineByIdAuth(user.getId(), routine.getId());

        assertEquals(routine, foundRoutine);
    }

    @Test
    public void testCreateDuplicateRoutine() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        assertThrows(DuplicateInstanceException.class, () -> {
            routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        });
    }

    @Test
    public void testUpdateRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user@test.com");
        Routine routine = routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineService.updateRoutine(user.getId(), routine.getId(), "new name", "new description", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.INTERMEDIATE);

        Routine updatedRoutine = routineService.findRoutineByIdAuth(user.getId(), routine.getId());

        assertEquals("new name", updatedRoutine.getName());
        assertEquals("new description", updatedRoutine.getDescription());
        assertEquals(Routine.DifficultyType.INTERMEDIATE, updatedRoutine.getDifficulty());
    }

    @Test
    public void testUpdateRoutineDuplicateName() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        routineService.createRoutine("routine1", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        Routine routine2 = routineService.createRoutine("routine2", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        assertThrows(DuplicateInstanceException.class, () -> {
            routineService.updateRoutine(user.getId(), routine2.getId(), "routine1", "new description", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        });
    }

    @Test
    public void testUpdateRoutineWithoutPermission() throws Exception {
        User trainer = createUser("trainer@test.com");
        trainer.setRole(User.RoleType.TRAINER);
        trainer = userDao.save(trainer);

        User client = createUser("client@test.com");

        Routine routine = routineService.createRoutine("routine", "d", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        assertThrows(PermissionException.class, () -> {
            routineService.updateRoutine(client.getId(), routine.getId(), "x", "y", Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        });
    }

    @Test
    public void testDeleteRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user@test.com");
        Routine routine = routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineService.deleteRoutine(user.getId(), routine.getId());

        assertThrows(InstanceNotFoundException.class, () -> {
            routineService.findRoutineByIdAuth(user.getId(), routine.getId());
        });
    }

    @Test
    public void testDeleteRoutineWithoutPermission() throws Exception {
        User trainer = createUser("trainer@test.com");
        trainer.setRole(User.RoleType.TRAINER);
        trainer = userDao.save(trainer);

        User client = createUser("client@test.com");

        Routine routine = routineService.createRoutine("routine", "d", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        assertThrows(PermissionException.class, () -> {
            routineService.deleteRoutine(client.getId(), routine.getId());
        });
    }

    @Test
    public void testGetAllRoutines() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user@test.com");
        User user2 = createUser("user2@test.com");
        routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        routineService.createRoutine("routine2", "description2", user, Routine.VisibilityType.PRIVATE, Routine.DifficultyType.BEGINNER);

        // 4 en el script + 2 creados en este test
        assertEquals(6, routineService.findAllRoutines(user.getId()).size());
        assertEquals(5, routineService.findAllRoutines(user2.getId()).size());
    }

    @Test
    public void testGetRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user@test.com");
        Routine routine = routineDao.findById(1L).get();
        assertEquals(routineService.findRoutineByIdAuth(user.getId(), 1L), routine);
        routine.setVisibility(Routine.VisibilityType.PRIVATE);
        assertThrows(PermissionException.class, () -> {
            routineService.deleteRoutine(user.getId(), routine.getId());
        });
    }

    @Test
    public void testDeleteRoutineCascadesNotifications() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User trainer = createUser("trainer@test.com");
        trainer.setRole(User.RoleType.TRAINER);
        trainer = userDao.save(trainer);

        User client = createUser("client@test.com");

        userFollowService.followUser(client.getId(), trainer.getId());

        Routine routine = routineService.createRoutine("testRoutine", "description", trainer, Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineLikeService.likeRoutine(client.getId(), routine.getId());

        List<Notification> trainerNotifications = notificationService.getNotificationsByUser(trainer.getId());
        List<Notification> clientNotifications = notificationService.getNotificationsByUser(client.getId());

        assertEquals(2, trainerNotifications.size());
        boolean hasFollow = trainerNotifications.stream().anyMatch(n -> n.getType() == Notification.NotificationType.FOLLOW);
        boolean hasLike = trainerNotifications.stream().anyMatch(n -> n.getType() == Notification.NotificationType.ROUTINE_LIKE && n.getIdToRedirect().equals(routine.getId()));
        assertTrue(hasFollow);
        assertTrue(hasLike);

        assertEquals(1, clientNotifications.size());
        assertEquals(Notification.NotificationType.NEW_ROUTINE, clientNotifications.get(0).getType());
        assertEquals(routine.getId(), clientNotifications.get(0).getIdToRedirect());

        routineService.deleteRoutine(trainer.getId(), routine.getId());

        trainerNotifications = notificationService.getNotificationsByUser(trainer.getId());
        clientNotifications = notificationService.getNotificationsByUser(client.getId());

        assertTrue(trainerNotifications.stream().noneMatch(n -> n.getIdToRedirect() != null && n.getIdToRedirect().equals(routine.getId())));
        assertTrue(clientNotifications.stream().noneMatch(n -> n.getIdToRedirect() != null && n.getIdToRedirect().equals(routine.getId())));
    }

    @Test
    public void testFindRoutineByIdNonExistent() {
        assertThrows(InstanceNotFoundException.class, () -> {
            routineService.findRoutineById(999L);
        });
    }

    @Test
    public void testFindRoutinesByFilters() throws DuplicateInstanceException, InstanceNotFoundException {
        User trainer = createUser("trainerX@test.com");
        trainer.setRole(RoleType.TRAINER);
        trainer = userDao.save(trainer);

        // Rutinas distintas para filtrar
        Routine r1 = routineService.createRoutine("FX1", "d", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);
        Routine r2 = routineService.createRoutine("FX2", "d", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.INTERMEDIATE);

        // client para ejecutar filtros
        User client = createUser("clientX@test.com");

        List<Routine> filtered = routineService.findRoutinesByFilters(
                client.getId(),
                null,                     // equipment
                null,                     // muscleGroup
                Routine.DifficultyType.INTERMEDIATE,
                trainer.getId()
        );

        assertEquals(1, filtered.size());
        assertEquals(r2.getId(), filtered.get(0).getId());
    }

}
