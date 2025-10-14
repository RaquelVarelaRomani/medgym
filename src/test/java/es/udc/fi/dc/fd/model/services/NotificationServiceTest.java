package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.jupiter.api.Assertions.*;

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
    public void testNotificationService() throws InstanceNotFoundException, DuplicateInstanceException {
        User client = userDao.save(new User("client", "client", "client@client.com",
                "666777222", "password", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainer", "trainer", "trainer@trainer.com",
                "666777223", "password", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));
        userFollowService.followTrainer(client.getId(), trainer.getId());
        routineService.createRoutine("routine", "routine", trainer, Routine.VisibilityType.PUBLIC);

        assertEquals(1, notificationService.getNotificationsByUser(client.getId()).size());
    }

    @Test
    public void testMarkNotificationAsRead() throws Exception {
        User client = userDao.save(new User("client2", "client2", "cient2@client.com",
                "666777224", "password", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainer2", "trainer2", "trainer2@trainer.com",
                "666777225", "password", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        userFollowService.followTrainer(client.getId(), trainer.getId());
        routineService.createRoutine("routine2", "desc", trainer, Routine.VisibilityType.PUBLIC);

        var notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());

        var notification = notifications.get(0);
        assertFalse(notification.getIsRead());

        // Marcar como leída
        notificationService.markNotificationAsRead(notification.getId());

        var updated = notificationService.getNotificationsByUser(client.getId()).get(0);
        assertTrue(updated.getIsRead());
    }

    @Test
    public void testDeleteNotification() throws Exception {
        User client = userDao.save(new User("client3", "client3", "client3@client.com",
                "666777226", "password", null, User.RoleType.CLIENT, User.StatusType.ACTIVE));
        User trainer = userDao.save(new User("trainer3", "trainer3", "trainer3@trainer.com",
                "666777227", "password", null, User.RoleType.TRAINER, User.StatusType.ACTIVE));

        userFollowService.followTrainer(client.getId(), trainer.getId());
        routineService.createRoutine("routine3", "desc", trainer, Routine.VisibilityType.PUBLIC);

        // Verificar que hay 1 notificación generada
        var notifications = notificationService.getNotificationsByUser(client.getId());
        assertEquals(1, notifications.size());

        var notificationId = notifications.get(0).getId();

        // Eliminar la notificación
        notificationService.deleteNotification(notificationId);

        // Verificar que ya no existe
        var afterDelete = notificationService.getNotificationsByUser(client.getId());
        assertTrue(afterDelete.isEmpty());
    }

}
