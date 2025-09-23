package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

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

    private Exercise createExercise(String name){
        Exercise exercise = new Exercise(name, "Ejercicio.");
        return exerciseDao.save(exercise);
    }

    private Routine createRoutine(String name, User user){
        Routine routine = new Routine(name, "Rutina",
                LocalDateTime.now().withNano(0), LocalDateTime.now().withNano(0), user);
        return routineDao.save(routine);
    }

    @Test
    public void testAddExerciseToRoutine() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise.getId(), routine.getId(), (byte) 5, null);
        Block<RoutineExercise> block = routineExerciseService.getExercisesForRoutines(routine.getId(), 0, 2);
        assertEquals(1, block.getItems().size());
        RoutineExercise re = block.getItems().get(0);
        assertEquals(exercise.getId(), re.getExercise().getId());
        assertNull(re.getDuration());
    }

    @Test
    public void testRemoveExerciseFromRoutine() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise.getId(), routine.getId(), (byte) 5, null);
        Block<RoutineExercise> block = routineExerciseService.getExercisesForRoutines(routine.getId(), 0, 2);
        assertEquals(1, block.getItems().size());
        routineExerciseService.removeExerciseFromRoutine(trainer.getId(), exercise.getId(), routine.getId());
        Block<RoutineExercise> block2 = routineExerciseService.getExercisesForRoutines(routine.getId(), 0, 2);
        assertEquals(0, block2.getItems().size());
    }

    @Test
    public void testUpdateExerciseFromRoutine() throws PermissionException, InstanceNotFoundException {
        User trainer = createUser("Pepe", User.RoleType.TRAINER);
        Exercise exercise = createExercise("Ejercicio");
        Routine routine = createRoutine("Rutina", trainer);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise.getId(), routine.getId(), (byte) 5, null);
        routineExerciseService.updateExerciseOnRoutine(trainer.getId(), exercise.getId(), routine.getId(), null, (short) 60);
        Block<RoutineExercise> block = routineExerciseService.getExercisesForRoutines(routine.getId(), 0, 2);
        RoutineExercise re = block.getItems().get(0);
        assertNull(re.getRepetitionsNumber());
    }

}
