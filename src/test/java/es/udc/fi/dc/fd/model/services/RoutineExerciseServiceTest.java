package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import jakarta.transaction.Transactional;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.util.Date;

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

    @Test
    public void testAddExerciseToRoutine() throws PermissionException, InstanceNotFoundException {
        User trainer = new User("Pepe", "Domingo", "pepe@domingo.com",
                "666555444", "password");
        trainer.setRole(User.RoleType.TRAINER);
        userDao.save(trainer);

        Exercise exercise = new Exercise("Ejercicio", "Ejercicio.");
        exerciseDao.save(exercise);

        Routine routine = new Routine("Rutina", "Rutina",
                LocalDateTime.now().withNano(0), LocalDateTime.now().withNano(0), trainer);
        routineDao.save(routine);

        routineExerciseService.addExerciseToRoutine(trainer.getId(), exercise.getId(), routine.getId(), (byte) 5, null);
    }
}
