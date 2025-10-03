
package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RoutineServiceTest {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserDao userDao;

    private User createUser(String userName) {
        User user = new User(userName, "password", "name", "lastName", "email@test.com", RoleType.CLIENT);
        return userDao.save(user);
    }

    @Test
    public void testCreateAndFindRoutine() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Routine routine = routineService.createRoutine("routine", "description", user);

        Routine foundRoutine = routineService.findRoutineById(routine.getId());

        assertEquals(routine, foundRoutine);
    }

    @Test
    public void testCreateDuplicateRoutine() throws DuplicateInstanceException {
        User user = createUser("user");
        routineService.createRoutine("routine", "description", user);

        assertThrows(DuplicateInstanceException.class, () -> {
            routineService.createRoutine("routine", "description", user);
        });
    }

    @Test
    public void testUpdateRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user");
        Routine routine = routineService.createRoutine("routine", "description", user);

        routineService.updateRoutine(user.getId(), routine.getId(), "new name", "new description");

        Routine updatedRoutine = routineService.findRoutineById(routine.getId());

        assertEquals("new name", updatedRoutine.getName());
        assertEquals("new description", updatedRoutine.getDescription());
    }

    @Test
    public void testUpdateRoutineDuplicateName() throws DuplicateInstanceException {
        User user = createUser("user");
        routineService.createRoutine("routine1", "description", user);
        Routine routine2 = routineService.createRoutine("routine2", "description", user);

        assertThrows(DuplicateInstanceException.class, () -> {
            routineService.updateRoutine(user.getId(), routine2.getId(), "routine1", "new description");
        });
    }

    @Test
    public void testDeleteRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user");
        Routine routine = routineService.createRoutine("routine", "description", user);

        routineService.deleteRoutine(user.getId(), routine.getId());

        assertThrows(InstanceNotFoundException.class, () -> {
            routineService.findRoutineById(routine.getId());
        });
    }
}
