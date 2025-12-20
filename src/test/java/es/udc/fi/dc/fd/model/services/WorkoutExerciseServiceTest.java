package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WorkoutExerciseServiceTest {

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
        trainer = new User("Carlos", "Gómez", "trainer@example.com", "602111222", "1234",
                RoleType.TRAINER, User.StatusType.ACTIVE);
        trainer = userDao.save(trainer);

        // Crear cliente
        client = new User("Laura", "Martínez", "client@example.com", "600343444", "1234", RoleType.CLIENT,
                User.StatusType.ACTIVE);
        client = userDao.save(client);

        // Crear rutina
        routine = new Routine("Rutina fuerza", "Descripción básica", VisibilityType.PUBLIC,
                Routine.DifficultyType.BEGINNER, trainer);
        routine = routineDao.save(routine);

        // Crear ejercicio
        exercise = new Exercise("Sentadillas Test", "Ejercicio para piernas", MuscleGroup.LEG, Equipment.NONE,
                new byte[]{1, 2, 3}, Exercise.ExerciseStatus.APPROVED, trainer);
        exercise = exerciseDao.save(exercise);

        // Asignar ejercicio a la rutina
        routineExercise = new RoutineExercise(routine, exercise, RoutineExercise.ExerciseType.STRENGTH, 1);
        routineExercise = routineExerciseDao.save(routineExercise);

        // Crear un workout para el cliente basado en esa rutina
        workout = new Workout(LocalDateTime.now(), null, routine, client);
        workout = workoutDao.save(workout);
    }

    @Test
    void testAddWorkoutExerciseCreatesRecord() {
        List<WorkoutExercise> preAll = workoutExerciseDao.findAll();
        WorkoutExercise we = assertDoesNotThrow(() -> workoutExerciseService.addWorkoutExercise(
                (short) 10,
                (short) 50,
                (short) 60,
                workout.getId(),
                routineExercise.getId()));

        assertNotNull(we.getId());
        assertEquals(10, (short) we.getReps());
        assertEquals(50, (short) we.getWeight());
        assertEquals(60, (short) we.getDurationSeconds());
        assertEquals(workout.getId(), we.getWorkout().getId());
        assertEquals(routineExercise.getId(), we.getRoutineExercise().getId());

        List<WorkoutExercise> all = workoutExerciseDao.findAll();
        assertEquals(preAll.size() + 1, all.size());
    }

    @Test
    void testAddWorkoutExerciseWithNonexistentWorkoutThrows() {
        assertThrows(InstanceNotFoundException.class, () -> workoutExerciseService.addWorkoutExercise(
                (short) 10, (short) 50, (short) 60, 999L, routineExercise.getId()));
    }

    @Test
    void testAddWorkoutExerciseWithNonexistentRoutineExerciseThrows() {
        assertThrows(InstanceNotFoundException.class, () -> workoutExerciseService.addWorkoutExercise(
                (short) 10, (short) 50, (short) 60, workout.getId(), 999L));
    }

    @Test
    void testFindWorkoutExercisesByWorkoutIdReturnsList() {
        // Crear 2 ejercicios de entrenamiento
        assertDoesNotThrow(() -> workoutExerciseService.addWorkoutExercise((short) 10, (short) 50, (short) 60,
                workout.getId(), routineExercise.getId()));
        assertDoesNotThrow(() -> workoutExerciseService.addWorkoutExercise((short) 8, (short) 40, (short) 45,
                workout.getId(), routineExercise.getId()));

        List<WorkoutExercise> list = assertDoesNotThrow(
                () -> workoutExerciseService.findWorkoutExercisesByWorkoutId(workout.getId()));

        assertEquals(2, list.size());
        assertTrue(list.stream().allMatch(we -> we.getWorkout().getId().equals(workout.getId())));
    }

    @Test
    void testFindWorkoutExercisesByWorkoutIdEmptyList() {
        List<WorkoutExercise> list = assertDoesNotThrow(
                () -> workoutExerciseService.findWorkoutExercisesByWorkoutId(workout.getId()));

        assertTrue(list.isEmpty());
    }

    @Test
    void testFindWorkoutExercisesByWorkoutIdThrowsIfWorkoutNotFound() {
        assertThrows(InstanceNotFoundException.class,
                () -> workoutExerciseService.findWorkoutExercisesByWorkoutId(999L));
    }

    @Test
    void testFindWorkoutExercisesByWorkoutIdsReturnsExercises() {
        Workout workout1 = workoutDao
                .save(new Workout(LocalDateTime.now().minusHours(1), null, routine, client));
        Workout workout2 = workoutDao
                .save(new Workout(LocalDateTime.now().minusHours(2), null, routine, client));

        assertDoesNotThrow(() -> workoutExerciseService.addWorkoutExercise((short) 10, (short) 50, (short) 60,
                workout1.getId(), routineExercise.getId()));
        assertDoesNotThrow(() -> workoutExerciseService.addWorkoutExercise((short) 8, (short) 40, (short) 45,
                workout2.getId(), routineExercise.getId()));

        List<WorkoutExercise> exercises = assertDoesNotThrow(() -> workoutExerciseService
                .findWorkoutExercisesByWorkoutIds(List.of(workout1.getId(), workout2.getId())));

        assertEquals(2, exercises.size());
        assertTrue(exercises.stream().allMatch(we -> we.getWorkout().getId().equals(workout1.getId())
                || we.getWorkout().getId().equals(workout2.getId())));
    }

    @Test
    void testFindWorkoutExercisesByWorkoutIdsEmptyList() {
        List<WorkoutExercise> exercises = assertDoesNotThrow(
                () -> workoutExerciseService.findWorkoutExercisesByWorkoutIds(List.of()));

        assertTrue(exercises.isEmpty());
    }
}
