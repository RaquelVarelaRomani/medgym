
package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ExerciseServiceTest {

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private UserDao userDao;

    private User createUser(String userName) {
        User user = new User(userName, "password", "name", "lastName", "email@test.com");
        return userDao.save(user);
    }

    @Test
    public void testCreateAndFindExercise() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        Exercise foundExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(exercise, foundExercise);
    }

    @Test
    public void testCreateDuplicateExercise() throws DuplicateInstanceException {
        User user = createUser("user");
        exerciseService.createExercise("exercise", "description", user);

        assertThrows(DuplicateInstanceException.class, () -> {
            exerciseService.createExercise("exercise", "description", user);
        });
    }

    @Test
    public void testUpdateExercise() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.updateExercise(exercise.getId(), "new name", "new description");

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals("new name", updatedExercise.getName());
        assertEquals("new description", updatedExercise.getDescription());
    }

    @Test
    public void testUpdateExerciseDuplicateName() throws DuplicateInstanceException {
        User user = createUser("user");
        exerciseService.createExercise("exercise1", "description", user);
        Exercise exercise2 = exerciseService.createExercise("exercise2", "description", user);

        assertThrows(DuplicateInstanceException.class, () -> {
            exerciseService.updateExercise(exercise2.getId(), "exercise1", "new description");
        });
    }

    @Test
    public void testDeleteExercise() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.deleteExercise(exercise.getId());

        assertThrows(InstanceNotFoundException.class, () -> {
            exerciseService.findExerciseById(exercise.getId());
        });
    }
}
