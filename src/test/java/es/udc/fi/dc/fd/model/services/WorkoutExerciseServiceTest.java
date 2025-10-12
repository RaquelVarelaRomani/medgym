package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static es.udc.fi.dc.fd.model.entities.User.RoleType;
import static es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class WorkoutExerciseServiceTest {

    @Autowired
    private WorkoutExerciseService workoutExerciseService;

    @Autowired
    private WorkoutExerciseDao workoutExerciseDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ExerciseDao exerciseDao;

    private User trainer;
    private User client;
    private Routine routine;
    private Exercise exercise;
    private RoutineExercise routineExercise;
    private Workout workout;

    @BeforeEach
    void setUp() {
        // Crear entrenador
        trainer = new User("Carlos", "Gómez", "trainer@example.com", "602111222", "1234", null, RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer = userDao.save(trainer);

        // Crear cliente
        client = new User("Laura", "Martínez", "client@example.com", "600343444", "1234", null, RoleType.CLIENT, User.StatusType.ACTIVE);
        client = userDao.save(client);

        // Crear rutina
        routine = new Routine("Rutina fuerza", "Descripción básica", VisibilityType.PUBLIC, trainer);
        routine = routineDao.save(routine);

        // Crear ejercicio
        exercise = new Exercise("Sentadillas", "Ejercicio para piernas", Exercise.ExerciseStatus.APPROVED, trainer);
        exercise = exerciseDao.save(exercise);

        // Asignar ejercicio a la rutina
        routineExercise = new RoutineExercise(routine, exercise, 1);
        routineExercise = routineExerciseDao.save(routineExercise);

        // Crear un workout para el cliente basado en esa rutina
        workout = new Workout(LocalDateTime.now(), null, routine, client);
        workout = workoutDao.save(workout);
    }

    @Test
    public void testAddWorkoutExerciseCreatesRecord() {
        WorkoutExercise we = assertDoesNotThrow(() ->
                workoutExerciseService.addWorkoutExercise(
                        (short) 10,
                        (short) 50,
                        (short) 60,
                        workout.getId(),
                        routineExercise.getId()
                ));

        assertNotNull(we.getId());
        assertEquals(10, (short) we.getReps());
        assertEquals(50, (short) we.getWeight());
        assertEquals(60, (short) we.getDurationSeconds());
        assertEquals(workout.getId(), we.getWorkout().getId());
        assertEquals(routineExercise.getId(), we.getRoutineExercise().getId());

        List<WorkoutExercise> all = workoutExerciseDao.findAll();
        assertEquals(14, all.size());
    }

    @Test
    public void testAddWorkoutExerciseWithNonexistentWorkoutThrows() {
        assertThrows(InstanceNotFoundException.class, () ->
                workoutExerciseService.addWorkoutExercise(
                        (short) 10, (short) 50, (short) 60, 999L, routineExercise.getId()));
    }

    @Test
    public void testAddWorkoutExerciseWithNonexistentRoutineExerciseThrows() {
        assertThrows(InstanceNotFoundException.class, () ->
                workoutExerciseService.addWorkoutExercise(
                        (short) 10, (short) 50, (short) 60, workout.getId(), 999L));
    }

    @Test
    public void testFindWorkoutExercisesByWorkoutIdReturnsList() {
        // Crear 2 ejercicios de entrenamiento
        assertDoesNotThrow(() -> workoutExerciseService.addWorkoutExercise((short) 10, (short) 50, (short) 60, workout.getId(), routineExercise.getId()));
        assertDoesNotThrow(() -> workoutExerciseService.addWorkoutExercise((short) 8, (short) 40, (short) 45, workout.getId(), routineExercise.getId()));

        List<WorkoutExercise> list = assertDoesNotThrow(() ->
                workoutExerciseService.findWorkoutExercisesByWorkoutId(workout.getId()));

        assertEquals(2, list.size());
        assertTrue(list.stream().allMatch(we -> we.getWorkout().getId().equals(workout.getId())));
    }

    @Test
    public void testFindWorkoutExercisesByWorkoutIdEmptyList() {
        List<WorkoutExercise> list = assertDoesNotThrow(() ->
                workoutExerciseService.findWorkoutExercisesByWorkoutId(workout.getId()));

        assertTrue(list.isEmpty());
    }

    @Test
    public void testFindWorkoutExercisesByWorkoutIdThrowsIfWorkoutNotFound() {
        assertThrows(InstanceNotFoundException.class, () ->
                workoutExerciseService.findWorkoutExercisesByWorkoutId(999L));
    }
}
