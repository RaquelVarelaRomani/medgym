package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import jakarta.transaction.Transactional;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;

import static org.junit.Assert.*;

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

    private User createUser(String email, User.RoleType role) {
        User trainer = new User("Pepe", "Domingo", email,
                "666555444", "password");
        trainer.setRole(role);
        return userDao.save(trainer);
    }

    private Routine createRoutine(String routineName){
        //Routine routine = new Routine(routineName, "The description", LocalDateTime.now().withNano(0), LocalDateTime.now().withNano(0));
        //return routineDao.save(routine);
        return new Routine();
    }

    private Exercise createExercise(String exerciseName){
        Exercise exercise = new Exercise(exerciseName, "The description");
        return exerciseDao.save(exercise);
    }

    private Routine createRoutine(String name, User user){
        Routine routine = new Routine(name, "Rutina",user);
        return routineDao.save(routine);
    }

    @Test
    public void testAddExerciseToRoutine() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise.getId(), routine.getId(), "Description");
        Page<RoutineExercise> page = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(1, page.getContent().size());
        RoutineExercise re = page.getContent().get(0);
        assertEquals(exercise.getId(), re.getExercise().getId());
    }

    @Test
    public void testRemoveExerciseFromRoutine() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);

        RoutineExercise routineExercise = routineExerciseService.addExerciseToRoutine(trainer.getId(),
                exercise.getId(), routine.getId(),"Description");
        Page<RoutineExercise> page = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(1, page.getContent().size());
        routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routineExercise.getId());
        Page<RoutineExercise> page2 = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        assertEquals(0, page2.getContent().size());
    }

    @Test
    public void testUpdateExerciseFromRoutine() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);

        RoutineExercise routineExercise = routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise.getId(),
                routine.getId(), "Description");
        routineExerciseService.updateExerciseOnRoutine(trainer.getId(), routineExercise.getId(), exercise.getId(),
                routine.getId(), "Description 2");
        Page<RoutineExercise> page = routineExerciseService.getExercisesForRoutines(routine.getId(), PageRequest.of(0, 2));
        RoutineExercise re = page.getContent().get(0);
        assertEquals(exercise.getId(), re.getExercise().getId());
        assertEquals(routineExercise.getExercise().getDescription(), re.getExercise().getDescription());
    }

    @Test
    public void testRemoveNotValidExercise() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);
        RoutineExercise routineExercise = routineExerciseService.addExerciseToRoutine(trainer.getId(),
                exercise.getId(), routine.getId(), "Description");
        routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routineExercise.getId());
        assertThrows(InstanceNotFoundException.class, () ->
                routineExerciseService.removeExerciseFromRoutine(trainer.getId(), routineExercise.getId()));
    }

    @Test
    public void testGetExercisesForRoutinesPaging() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise1 = createExercise("Ejercicio 1");
        Exercise exercise2 = createExercise("Ejercicio 2");
        Exercise exercise3 = createExercise("Ejercicio 3");
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise1.getId(), routine.getId(), "Description");
        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise2.getId(), routine.getId(), "Description 2");
        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise3.getId(), routine.getId(), "Description 3");

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
