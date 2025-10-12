package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.UserFollow;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.hibernate.validator.internal.util.Contracts.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

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
    private UserService userService;

    @Autowired
    private UserFollowService userFollowService;

    @Autowired
    private UserDao userDao;

    @Test
    public void testNotificationService() throws InstanceNotFoundException, DuplicateInstanceException {
        User client = userDao.save(new User("client", "client", "client@client.com",
                "666777222", "password", null, User.RoleType.CLIENT));
        User trainer = userDao.save(new User("trainer", "trainer", "trainer@trainer.com",
                "666777223", "password", null, User.RoleType.TRAINER));
        userFollowService.followTrainer(client.getId(), trainer.getId());
        routineService.createRoutine("routine", "routine", trainer, Routine.VisibilityType.PUBLIC);

        assertEquals(1, notificationService.getNotificationsByUser(client.getId()).size());
    }
}
