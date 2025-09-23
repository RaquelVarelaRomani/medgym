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
@Ignore
public class RoutineExerciseServiceTest {
    @Autowired
    private RoutineExerciseService routineExerciseService;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private UserDao userDao;

    private User createUser(String userName){
        User user = new User(userName, "12345678", "Pepe", "Domingo", "pepe@email.com");
        return userDao.save(user);
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

    @Test
    public void testAddExerciseToRoutine() throws PermissionException, InstanceNotFoundException {
        User user = createUser("user");
        Routine routine = createRoutine("routine");
        Exercise exercise = createExercise("exercise");

        routineExerciseService.addExerciseToRoutine(user.getId(), exercise.getId(), routine.getId(), (byte) 5, null);
    }
}
