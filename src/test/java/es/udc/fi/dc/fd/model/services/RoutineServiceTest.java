
package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
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
    @Autowired
    private RoutineDao routineDao;

    private User createUser(String userName) {
        User user = new User(userName, "password", userName + "@test.com", userName, "email@test.com", null);
        return userDao.save(user);
    }

    @Test
    public void testCreateAndFindRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user");
        Routine routine = routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC);

        Routine foundRoutine = routineService.findRoutineById(user.getId(), routine.getId());

        assertEquals(routine, foundRoutine);
    }

    @Test
    public void testCreateDuplicateRoutine() throws DuplicateInstanceException {
        User user = createUser("user");
        routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC);

        assertThrows(DuplicateInstanceException.class, () -> {
            routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC);
        });
    }

    @Test
    public void testUpdateRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user");
        Routine routine = routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC);

        routineService.updateRoutine(user.getId(), routine.getId(), "new name", "new description", Routine.VisibilityType.PUBLIC );

        Routine updatedRoutine = routineService.findRoutineById(user.getId(), routine.getId());

        assertEquals("new name", updatedRoutine.getName());
        assertEquals("new description", updatedRoutine.getDescription());
    }

    @Test
    public void testUpdateRoutineDuplicateName() throws DuplicateInstanceException {
        User user = createUser("user");
        routineService.createRoutine("routine1", "description", user, Routine.VisibilityType.PUBLIC);
        Routine routine2 = routineService.createRoutine("routine2", "description", user, Routine.VisibilityType.PUBLIC);

        assertThrows(DuplicateInstanceException.class, () -> {
            routineService.updateRoutine(user.getId(), routine2.getId(), "routine1", "new description", Routine.VisibilityType.PUBLIC);
        });
    }

    @Test
    public void testDeleteRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user");
        Routine routine = routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC);

        routineService.deleteRoutine(user.getId(), routine.getId());

        assertThrows(InstanceNotFoundException.class, () -> {
            routineService.findRoutineById(user.getId(), routine.getId());
        });
    }

    @Test
    public void testGetAllRoutines() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user");
        User user2 = createUser("user2");
        routineService.createRoutine("routine", "description", user, Routine.VisibilityType.PUBLIC);
        routineService.createRoutine("routine2", "description2", user, Routine.VisibilityType.PRIVATE);

        // 4 en el script + 2 creados en este test
        assertEquals(6, routineService.findAllRoutines(user.getId()).size());
        assertEquals(5, routineService.findAllRoutines(user2.getId()).size());
    }

    @Test
    public void testGetRoutine() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = createUser("user");
        Routine routine = routineDao.findById(1L).get();
        assertEquals(routineService.findRoutineById(user.getId(), 1L), routine);
        routine.setVisibility(Routine.VisibilityType.PRIVATE);
        assertThrows(PermissionException.class, () -> {
            routineService.deleteRoutine(user.getId(), routine.getId());
        });
    }
}
