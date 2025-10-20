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
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;

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
    private ExerciseDao exerciseDao;

    @Autowired
    private UserDao userDao;

    private User createTrainer(String email) {
        User trainer = new User("Pepe", "Domingo", email,
                "666555444", "password", null, RoleType.TRAINER, User.StatusType.ACTIVE);
        return userDao.save(trainer);
    }

    private Exercise createExercise(String exerciseName, User user){
        Exercise exercise = new Exercise(exerciseName, "The description", "Piernas", "Mancuernas", new byte[]{1,2,3}, ExerciseStatus.PENDING, user);
        return exerciseDao.save(exercise);
    }

    private Routine createRoutine(String name, User user){
        Routine routine = new Routine(name, "Rutina",Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, user);
        return routineDao.save(routine);
    }

    @Test
    public void testAddExerciseToRoutine() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainer("pepe@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        Page<RoutineExercise> page = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(1, page.getContent().size());
        RoutineExercise re = page.getContent().get(0);
        assertEquals(exercise.getId(), re.getExercise().getId());
        assertEquals(Integer.valueOf(1), re.getPosition());
    }

    @Test
    public void testAddDuplicateExerciseToRoutine() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainer("pepe@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        assertThrows(DuplicateInstanceException.class, () -> routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 2));
    }


    @Test
    public void testRemoveExerciseFromRoutine() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainer("pepe@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        Page<RoutineExercise> page = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(1, page.getContent().size());
        routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routine.getId(), exercise.getId());
        Page<RoutineExercise> page2 = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(0, page2.getContent().size());
    }


    @Test
    public void testRemoveNotValidExercise() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainer("pepe@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);
        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routine.getId(), exercise.getId());
        assertThrows(InstanceNotFoundException.class, () ->
                routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routine.getId(), exercise.getId()));
    }

    @Test
    public void testUpdateExerciseInRoutine() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainer("pepe@trainer.com");
        Exercise exercise = createExercise("Ejercicio", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise.getId(), 1);
        RoutineExercise updatedRe = routineExerciseService.updateExerciseInRoutine(trainer.getId(), routine.getId(), exercise.getId(), 2);
        assertEquals(Integer.valueOf(2), updatedRe.getPosition());
    }


    @Test
    public void testGetExercisesForRoutinesPaging() throws PermissionException, InstanceNotFoundException, DuplicateInstanceException {
        User trainer = createTrainer("pepe@trainer.com");
        Exercise exercise1 = createExercise("Ejercicio 1", trainer);
        Exercise exercise2 = createExercise("Ejercicio 2", trainer);
        Exercise exercise3 = createExercise("Ejercicio 3", trainer);
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise1.getId(), 1);
        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise2.getId(), 2);
        routineExerciseService.addExerciseToRoutine(trainer.getId(), routine.getId(), exercise3.getId(), 3);

        Page<RoutineExercise> page1 = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(2, page1.getContent().size());
        assertEquals(3, page1.getTotalElements());
        assertTrue(page1.hasNext());
        assertFalse(page1.isLast());

        Page<RoutineExercise> page2 = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(1, 2));
        assertEquals(1, page2.getContent().size());
        assertEquals(3, page2.getTotalElements());
        assertFalse(page2.hasNext());
        assertTrue(page2.isLast());
    }
}
