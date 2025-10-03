
package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
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
        User user = new User(userName, "password", "name", "lastName", "email@test.com", RoleType.CLIENT);
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

    @Test
    public void testDeleteNonExistentExercise() {
        assertThrows(InstanceNotFoundException.class, () -> {
            exerciseService.deleteExercise(999L);
        });
    }

    @Test
    public void testFindNonExistentExercise() {
        assertThrows(InstanceNotFoundException.class, () -> {
            exerciseService.findExerciseById(999L);
        });
    }
    
    @Test
    public void testCreateExerciseWithDefaultStatus() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        Exercise foundExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(ExerciseStatus.PENDING, foundExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatus() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.APPROVED);

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(ExerciseStatus.APPROVED, updatedExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusNonExistentExercise() {
        assertThrows(InstanceNotFoundException.class, () -> {
            exerciseService.updateExerciseStatus(999L, ExerciseStatus.REJECTED);
        });
    }

    @Test
    public void testUpdateExerciseStatusToNull() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.updateExerciseStatus(exercise.getId(), null);

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(null, updatedExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusToSameValue() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.PENDING);

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(ExerciseStatus.PENDING, updatedExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusMultipleTimes() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.APPROVED);
        Exercise updatedExercise1 = exerciseService.findExerciseById(exercise.getId());
        assertEquals(ExerciseStatus.APPROVED, updatedExercise1.getStatus());

        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.REJECTED);
        Exercise updatedExercise2 = exerciseService.findExerciseById(exercise.getId());
        assertEquals(ExerciseStatus.REJECTED, updatedExercise2.getStatus());

        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.PENDING);
        Exercise updatedExercise3 = exerciseService.findExerciseById(exercise.getId());
        assertEquals(ExerciseStatus.PENDING, updatedExercise3.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusAfterNameChange() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.updateExercise(exercise.getId(), "new name", "new description");
        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.APPROVED);

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals("new name", updatedExercise.getName());
        assertEquals("new description", updatedExercise.getDescription());
        assertEquals(ExerciseStatus.APPROVED, updatedExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusAfterDeletion() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);

        exerciseService.deleteExercise(exercise.getId());

        assertThrows(InstanceNotFoundException.class, () -> {
            exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.REJECTED);
        });
    }

    @Test
    public void testFindAllExercises() throws DuplicateInstanceException {
        User user = createUser("user");
        exerciseService.createExercise("exercise1", "description1", user);
        exerciseService.createExercise("exercise2", "description2", user);

        var exercises = exerciseService.findAllExercises();

        assertEquals(12, exercises.size()); // Counting data.sql entries + 2 new ones
    }

    @Test
    public void testCreateExerciseSetsDefaultStatus() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user");
        Exercise exercise = exerciseService.createExercise("exercise", "description", user);    
        assertEquals(ExerciseStatus.PENDING, exercise.getStatus());
        assertEquals(ExerciseStatus.PENDING, exerciseService.findExerciseById(exercise.getId()).getStatus());
    }
}
