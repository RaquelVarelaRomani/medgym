package es.udc.fi.dc.fd.model.services;

import org.junit.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Notification;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import jakarta.transaction.Transactional;

import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserFollowService userFollowService;

    @Autowired
    private UserDao userDao;

    @Test
    public void testCreateNewRoutineNotification() throws InstanceNotFoundException, DuplicateInstanceException {
        User client = userDao.save(new User("clientA", "clientA", "clientA@test.com",
                "600000001", "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerA", "trainerA", "trainerA@test.com",
                "600000002", "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        userFollowService.followUser(client.getId(), trainer.getId());

        Routine routine = routineService.createRoutine("routineA", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        List<Notification> notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());

        Notification n = notifications.get(0);
        assertTrue(n.getMessage().contains("Nueva rutina: routineA"));
        assertEquals(Notification.NotificationType.NEW_ROUTINE, n.getType());
        assertEquals(routine.getId(), n.getIdToRedirect());
    }

    @Test
    public void testCreateFollowNotification() throws InstanceNotFoundException {
        User client = userDao.save(new User("clientB", "clientB", "clientB@test.com",
                "600000003", "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerB", "trainerB", "trainerB@test.com",
                "600000004", "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        notificationService.createFollowNotification(client, trainer);

        List<Notification> notifications = notificationService.getNotificationsByUser(trainer.getId());
        assertEquals(1, notifications.size());

        Notification n = notifications.get(0);
        assertTrue(n.getMessage().contains("ha comenzado a seguirte"));
        assertEquals(Notification.NotificationType.FOLLOW, n.getType());
        assertNull(n.getIdToRedirect());
    }

    @Test
    public void testCreateLikeNotification() throws DuplicateInstanceException, InstanceNotFoundException {
        User client = userDao.save(new User("clientC", "clientC", "clientC@test.com",
                "600000005", "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerC", "trainerC", "trainerC@test.com",
                "600000006", "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        Routine routine = routineService.createRoutine(
                "LikeRoutine", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        notificationService.createLikeNotification(client, trainer, routine);

        List<Notification> notifications = notificationService.getNotificationsByUser(trainer.getId());
        assertEquals(1, notifications.size());

        Notification n = notifications.get(0);
        assertTrue(n.getMessage().contains("ha dado like"));
        assertTrue(n.getMessage().contains("LikeRoutine"));
        assertEquals(Notification.NotificationType.LIKE, n.getType());
        assertEquals(routine.getId(), n.getIdToRedirect());
    }

    @Test
    public void testMarkNotificationAsRead() throws InstanceNotFoundException, DuplicateInstanceException {
        User client = userDao.save(new User("clientD", "clientD", "clientD@test.com",
                "600000007", "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerD", "trainerD", "trainerD@test.com",
                "600000008", "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        userFollowService.followUser(client.getId(), trainer.getId());
        routineService.createRoutine("routineD", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        var notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());
        var notification = notifications.get(0);
        assertFalse(notification.getIsRead());

        notificationService.markNotificationAsRead(notification.getId());

        var updated = notificationService.getNotificationsByUser(client.getId()).get(0);
        assertTrue(updated.getIsRead());
    }

    @Test
    public void testDeleteNotification() throws InstanceNotFoundException, DuplicateInstanceException {
        User client = userDao.save(new User("clientE", "clientE", "clientE@test.com",
                "600000009", "pass", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainerE", "trainerE", "trainerE@test.com",
                "600000010", "pass", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        userFollowService.followUser(client.getId(), trainer.getId());
        routineService.createRoutine("routineE", "desc", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        var notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());

        var id = notifications.get(0).getId();
        notificationService.deleteNotification(id);

        assertTrue(notificationService.getNotificationsByUser(client.getId()).isEmpty());
    }
}
