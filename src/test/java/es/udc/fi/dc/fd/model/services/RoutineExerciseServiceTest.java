package es.udc.fi.dc.fd.model.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;

import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RoutineExerciseServiceTest {

    @Autowired
    private RoutineExerciseService routineExerciseService;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserDao userDao;
    @Autowired
    private ExerciseService exerciseService;

    private User createTrainerPremium(String email) {
        User trainer = new User("Pepe", "Domingo", email,
                "666555444", "password", null, RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer.setTrainerPremium(true);
        return userDao.save(trainer);
    }

    private User createTrainerNonPremium(String email) {
        User trainer = new User("Pepe", "Domingo", email,
                "666555445", "password", null, RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer.setTrainerPremium(false);
        return userDao.save(trainer);
    }

    private Exercise createExercise(String exerciseName, User user) throws PermissionException, DuplicateInstanceException {
        return exerciseService.createExercise(exerciseName, "The description", MuscleGroup.LEG, Equipment.DUMBBELL, new byte[]{1,2,3}, user);
    }

    private Routine createRoutine(String name, User user) {
        Routine routine = new Routine(name, "Rutina",
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        return routineDao.save(routine);
    }


    @Test
    public void testAddExerciseToRoutinePremium() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainerPremium("premium@trainer.com");
        Exercise exercise = createExercise("Ejercicio Premium", trainer);
        Routine routine = createRoutine("Rutina Premium", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        Page<RoutineExercise> page = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));

        assertEquals(1, page.getContent().size());
    }

    @Test
    public void testNonPremiumCannotCreateExercise() {
        User trainer = createTrainerNonPremium("np1@trainer.com");

        assertThrows(PermissionException.class, () ->
                exerciseService.createExercise(
                        "Ex NP", "Desc",
                        MuscleGroup.LEG, Equipment.DUMBBELL,
                        new byte[]{1}, trainer
                )
        );
    }

    @Test
    public void testPremiumCanCreateExercise() throws Exception {
        User trainer = createTrainerPremium("p1@trainer.com");

        Exercise ex = exerciseService.createExercise(
                "Ex P", "Desc",
                MuscleGroup.CHEST, Equipment.BARBELL,
                new byte[]{1}, trainer
        );

        assertNotNull(ex.getId());
        assertEquals("Ex P", ex.getName());
    }

    @Test
    public void testClientCannotCreateExercise() {
        User client = new User(
                "C","L","client@test.com","600","p",null,
                RoleType.CLIENT, User.StatusType.ACTIVE
        );
        client = userDao.save(client);

        User finalClient = client;
        assertThrows(PermissionException.class, () ->
                exerciseService.createExercise(
                        "Ex C", "Desc",
                        MuscleGroup.BACK, Equipment.DUMBBELL,
                        new byte[]{1}, finalClient
                )
        );
    }

    @Test
    public void testAddDuplicateExerciseToRoutine() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainerPremium("dup@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);

        assertThrows(DuplicateInstanceException.class,
                () -> routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 2));
    }

    @Test
    public void testRemoveExerciseFromRoutine() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainerPremium("remove@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routine.getId(), exercise.getId());

        Page<RoutineExercise> page = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(0, page.getTotalElements());
    }

    @Test
    public void testRemoveNotValidExercise() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainerPremium("remove2@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routine.getId(), exercise.getId());

        assertThrows(InstanceNotFoundException.class,
                () -> routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routine.getId(), exercise.getId()));
    }

    @Test
    public void testUpdateExerciseInRoutine() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainerPremium("update@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);

        RoutineExercise updated = routineExerciseService.updateExerciseInRoutine(trainer.getId(), routine.getId(), exercise.getId(), 3);
        assertEquals(Integer.valueOf(3), updated.getPosition());
    }

    @Test
    public void testGetExercisesForRoutinesPaging() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainerPremium("paging@trainer.com");
        Routine routine = createRoutine("Rutina", trainer);

        Exercise ex1 = createExercise("E1", trainer);
        Exercise ex2 = createExercise("E2", trainer);
        Exercise ex3 = createExercise("E3", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), ex1.getId(), 1);
        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), ex2.getId(), 2);
        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), ex3.getId(), 3);

        Page<RoutineExercise> page1 = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(2, page1.getContent().size());
        assertTrue(page1.hasNext());

        Page<RoutineExercise> page2 = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(1, 2));
        assertEquals(1, page2.getContent().size());
        assertTrue(page2.isLast());
    }

    @Test
    public void testAddExerciseToRoutinePermissionDenied() throws DuplicateInstanceException, PermissionException {
        User trainer = createTrainerPremium("trainer@udc.es");
        User other = new User("X","Y","other@udc.es","600","p",null,
                RoleType.CLIENT, User.StatusType.ACTIVE);
        other = userDao.save(other);

        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        User finalOther = other;
        assertThrows(PermissionException.class,
                () -> routineExerciseService.addExerciseToRoutine(finalOther.getId(), routine.getId(), exercise.getId(), 1));
    }

    @Test
    public void testAddExerciseToRoutineNonExistingRoutine() throws PermissionException, DuplicateInstanceException {
        User trainer = createTrainerPremium("trainer2@udc.es");
        Exercise exercise = createExercise("Ejercicio", trainer);

        assertThrows(InstanceNotFoundException.class,
                () -> routineExerciseService.addExerciseToRoutine(trainer.getId(), 999L, exercise.getId(), 1));
    }
}
