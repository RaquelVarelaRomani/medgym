
package es.udc.fi.dc.fd.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import jakarta.transaction.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ExerciseServiceTest {

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private UserDao userDao;

    private User createUser(String userName) {
        User user = new User(userName, "password", "name", "lastName", "email@test.com", null, RoleType.CLIENT, User.StatusType.ACTIVE);
        return userDao.save(user);
    }

    private Exercise createBasicExercise(User user, String name) throws DuplicateInstanceException {
        return exerciseService.createExercise(
                name,
                "descripcion de prueba",
                "Piernas",
                "Mancuernas",
                new byte[]{1, 2, 3},
                user
        );
    }

    @Test
    public void testCreateAndFindExercise() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        Exercise foundExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(exercise, foundExercise);
    }

    @Test
    public void testCreateDuplicateExercise() throws DuplicateInstanceException {
        User user = createUser("user@test.com");
        exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        assertThrows(DuplicateInstanceException.class, () -> {
            createBasicExercise(user, "exercise");
        });
    }

    @Test
    public void testUpdateExercise() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExercise(exercise.getId(), "new name", "new description", "Espalda", "Barra", new byte[]{4,5,6});

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals("new name", updatedExercise.getName());
        assertEquals("new description", updatedExercise.getDescription());
        assertEquals("Espalda", updatedExercise.getMuscleGroup());
        assertEquals("Barra", updatedExercise.getEquipment());
    }

    @Test
    public void testUpdateExerciseDuplicateName() throws DuplicateInstanceException {
        User user = createUser("user@test.com");
        exerciseService.createExercise("exercise1", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        Exercise exercise2 = exerciseService.createExercise("exercise2", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        assertThrows(DuplicateInstanceException.class, () -> {
            exerciseService.updateExercise(exercise2.getId(), "exercise1", "new description", "Piernas", "Ninguno", new byte[]{1,2,3});
        });
    }

    @Test
    public void testDeleteExercise() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

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
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        Exercise foundExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(ExerciseStatus.PENDING, foundExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatus() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

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
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExerciseStatus(exercise.getId(), null);

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(null, updatedExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusToSameValue() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.PENDING);

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals(ExerciseStatus.PENDING, updatedExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusMultipleTimes() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

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
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExercise(exercise.getId(), "new name", "new description", "Brazos", "Mancuernas", new byte[]{1,2,3});
        exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.APPROVED);

        Exercise updatedExercise = exerciseService.findExerciseById(exercise.getId());

        assertEquals("new name", updatedExercise.getName());
        assertEquals("new description", updatedExercise.getDescription());
        assertEquals(ExerciseStatus.APPROVED, updatedExercise.getStatus());
    }

    @Test
    public void testUpdateExerciseStatusAfterDeletion() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.deleteExercise(exercise.getId());

        assertThrows(InstanceNotFoundException.class, () -> {
            exerciseService.updateExerciseStatus(exercise.getId(), ExerciseStatus.REJECTED);
        });
    }

    @Test
    public void testFindAllExercises() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        var exercisesPrev = exerciseService.findAllExercises(user.getId()).size();

        var ex1 = exerciseService.createExercise("exercise1", "description1", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        var ex2 = exerciseService.createExercise("exercise2", "description2", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExerciseStatus(ex1.getId(), ExerciseStatus.APPROVED);
        exerciseService.updateExerciseStatus(ex2.getId(), ExerciseStatus.APPROVED);

        var exercises = exerciseService.findAllExercises(user.getId());
        assertEquals(exercisesPrev + 2, exercises.size());
    }

    @Test
    public void testFindExercisesWithPendingStatus() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise1 = exerciseService.createExercise("exercise1", "description1", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        Exercise exercise2 = exerciseService.createExercise("exercise2", "description2", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        Exercise exercise3 = exerciseService.createExercise("exercise3", "description3", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExerciseStatus(exercise2.getId(), ExerciseStatus.APPROVED);
        exerciseService.updateExerciseStatus(exercise3.getId(), ExerciseStatus.REJECTED);

        var pendingExercises = exerciseService.findExercisesWithPendingStatus();

        assertEquals(3, pendingExercises.size());
        assertEquals(exercise1.getId(), pendingExercises.get(2).getId());
    }

    @Test
    public void testFindExercisesWithPendingStatusWhenNone() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise1 = exerciseService.createExercise("exercise1", "description1", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        Exercise exercise2 = exerciseService.createExercise("exercise2", "description2", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExerciseStatus(exercise1.getId(), ExerciseStatus.APPROVED);
        exerciseService.updateExerciseStatus(exercise2.getId(), ExerciseStatus.REJECTED);

        var pendingExercises = exerciseService.findExercisesWithPendingStatus();

        assertEquals(2, pendingExercises.size());
    }

    @Test
    public void testFindExercisesWithPendingStatusWhenAll() throws DuplicateInstanceException {
        User user = createUser("user@test.com");
        exerciseService.createExercise("exercise1", "description1", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        exerciseService.createExercise("exercise2", "description2", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        var pendingExercises = exerciseService.findExercisesWithPendingStatus();

        assertEquals(4, pendingExercises.size()); // data.sql pending + 2
    }

    @Test
    public void testFindExercisesWithPendingStatusAfterDeletion() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise1 = exerciseService.createExercise("exercise1", "description1", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        Exercise exercise2 = exerciseService.createExercise("exercise2", "description2", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.deleteExercise(exercise1.getId());

        var pendingExercises = exerciseService.findExercisesWithPendingStatus();

        // Only exercise2 should be pending + 2 from data.sql
        assertEquals(3, pendingExercises.size());
        assertEquals(exercise2.getId(), pendingExercises.get(2).getId());
    }

    @Test
    public void testFindExercisesWithPendingStatusAfterStatusUpdate() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise1 = exerciseService.createExercise("exercise1", "description1", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        Exercise exercise2 = exerciseService.createExercise("exercise2", "description2", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);

        exerciseService.updateExerciseStatus(exercise1.getId(), ExerciseStatus.APPROVED);

        var pendingExercises = exerciseService.findExercisesWithPendingStatus();

        // Only exercise2 should be pending + 2 from data.sql
        assertEquals(3, pendingExercises.size());
        assertEquals(exercise2.getId(), pendingExercises.get(2).getId());
    }

    @Test
    public void testCreateExerciseSetsDefaultStatus() throws DuplicateInstanceException, InstanceNotFoundException {
        User user = createUser("user@test.com");
        Exercise exercise = exerciseService.createExercise("exercise", "description", "Piernas", "Mancuernas", new byte[]{1,2,3}, user);
        assertEquals(ExerciseStatus.PENDING, exercise.getStatus());
        assertEquals(ExerciseStatus.PENDING, exerciseService.findExerciseById(exercise.getId()).getStatus());
    }
}
