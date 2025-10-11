package es.udc.fi.dc.fd.model.services;

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

import java.util.List;
import java.util.Map;

import static org.hibernate.validator.internal.util.Contracts.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RoutineSuscriptionServiceTest {
    @Autowired
    private RoutineSuscriptionService routineSuscriptionService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private RoutineSuscriptionDao routineSuscriptionDao;

    @Autowired
    private UserService userService;

    @Test
    public void testGetSuscriptions() throws PermissionException, InstanceNotFoundException {
        User trainer = userDao.save(new User("trainer", "trainer", "trainer@email.com",
                "666777222", "password", null, User.RoleType.TRAINER));
        Routine routine = routineDao.save(new Routine("test", "test", Routine.VisibilityType.PUBLIC,
                trainer));
        User client = userDao.save(new User("client", "client", "client@email.com",
                "666333555", "password", null, User.RoleType.CLIENT));

        routineSuscriptionDao.save(new RoutineSuscription(client, routine));

        Map<Routine, List<User>> result = routineSuscriptionService.getRoutineSuscriptions(trainer.getId());

        assertEquals(1, result.size());

        List<User> clients = result.get(routine);
        assertEquals(1, clients.size());
        assertEquals(client.getId(), clients.get(0).getId());
    }

    @Test
    public void testGetSuscriptionsClient() throws PermissionException, InstanceNotFoundException {
        User trainer = userDao.save(new User("trainer", "trainer", "trainer@email.com",
                "666777222", "password", null, User.RoleType.TRAINER));
        Routine routine = routineDao.save(new Routine("test", "test", Routine.VisibilityType.PUBLIC,
                trainer));
        User client = userDao.save(new User("client", "client", "client@email.com",
                "666333555", "password", null, User.RoleType.CLIENT));

        routineSuscriptionDao.save(new RoutineSuscription(client, routine));
        assertThrows(PermissionException.class, () -> routineSuscriptionService.getRoutineSuscriptions(client.getId()));
    }
}
