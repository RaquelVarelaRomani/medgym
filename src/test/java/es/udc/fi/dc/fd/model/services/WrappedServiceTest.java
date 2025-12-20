package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.entities.*;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.util.LinkedHashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.rest.dtos.WeightComparisonDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WrappedServiceTest {

    @Autowired
    private WrappedService wrappedService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoutineDao routineDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private WorkoutDao workoutDao;

    @Autowired
    private WorkoutExerciseDao workoutExerciseDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private User testUser;
    private Routine testRoutine;
    private Exercise weightExercise;
    private Exercise timeExercise;
    private RoutineExercise routineExerciseWeight;
    private RoutineExercise routineExerciseTime;

    static Stream<Arguments> exactWeightComparisonTestCases() {
        Stream<Arguments> argumentsStream = Stream.of(
                Arguments.of(4L, "gato pequeño"),
                Arguments.of(30L, "perro grande"),
                Arguments.of(70L, "persona"),
                Arguments.of(200L, "motocicleta"),
                Arguments.of(500L, "caballo"),
                Arguments.of(1200L, "coche pequeño"),
                Arguments.of(2000L, "SUV"),
                Arguments.of(4500L, "elefante"),
                Arguments.of(10000L, "autobús escolar"),
                Arguments.of(20000L, "camión de bomberos"),
                Arguments.of(40000L, "avión pequeño"),
                Arguments.of(150000L, "ballena azul"),
                Arguments.of(412000L, "Boeing 747"));
        return argumentsStream;
    }

    @BeforeEach
    void setUp() {
        testUser = new User("Test", "User", "test@example.com", "600000001",
                passwordEncoder.encode("password"), User.RoleType.CLIENT, User.StatusType.ACTIVE);
        testUser = userDao.save(testUser);

        testRoutine = new Routine("Test Routine", "Description", Routine.VisibilityType.PUBLIC,
                Routine.DifficultyType.BEGINNER, testUser);
        testRoutine = routineDao.save(testRoutine);

        weightExercise = new Exercise("Squats", "Leg exercise", Exercise.MuscleGroup.LEG,
                Exercise.Equipment.NONE, new byte[]{1, 2, 3}, Exercise.ExerciseStatus.APPROVED, testUser);
        weightExercise = exerciseDao.save(weightExercise);

        timeExercise = new Exercise("Plank", "Core exercise", Exercise.MuscleGroup.CORE,
                Exercise.Equipment.MAT, new byte[]{1, 2, 3}, Exercise.ExerciseStatus.APPROVED, testUser);
        timeExercise = exerciseDao.save(timeExercise);

        routineExerciseWeight = new RoutineExercise(testRoutine, weightExercise, 1);
        routineExerciseWeight = routineExerciseDao.save(routineExerciseWeight);

        routineExerciseTime = new RoutineExercise(testRoutine, timeExercise, 2);
        routineExerciseTime = routineExerciseDao.save(routineExerciseTime);
    }

    @Test
    void testCalculateYearlyTotalWeight_WithMultipleWorkouts() throws InstanceNotFoundException {
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);
        LocalDateTime feb2025 = LocalDateTime.of(2025, 2, 20, 14, 30);

        Workout workout1 = new Workout(jan2025, jan2025.plusHours(1), testRoutine, testUser);
        workout1 = workoutDao.save(workout1);

        Workout workout2 = new Workout(feb2025, feb2025.plusHours(1), testRoutine, testUser);
        workout2 = workoutDao.save(workout2);

        WorkoutExercise we1 = new WorkoutExercise((short) 10, (short) 50, null, workout1, routineExerciseWeight);
        workoutExerciseDao.save(we1);

        WorkoutExercise we2 = new WorkoutExercise((short) 12, (short) 60, null, workout2, routineExerciseWeight);
        workoutExerciseDao.save(we2);

        Long totalWeight = wrappedService.calculateYearlyTotalWeight(testUser.getId(), 2025);

        assertEquals(1220L, totalWeight);
    }

    @Test
    void testCalculateYearlyTotalWeight_ExcludesTimeBasedExercises() throws InstanceNotFoundException {
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);
        Workout workout = new Workout(jan2025, jan2025.plusHours(1), testRoutine, testUser);
        workout = workoutDao.save(workout);

        WorkoutExercise we1 = new WorkoutExercise((short) 10, (short) 50, null, workout, routineExerciseWeight);
        workoutExerciseDao.save(we1);

        WorkoutExercise we2 = new WorkoutExercise(null, null, (short) 60, workout, routineExerciseTime);
        workoutExerciseDao.save(we2);

        Long totalWeight = wrappedService.calculateYearlyTotalWeight(testUser.getId(), 2025);

        assertEquals(500L, totalWeight);
    }

    @Test
    void testCalculateYearlyTotalWeight_FiltersWorkoutsByYear() throws InstanceNotFoundException {
        LocalDateTime jan2024 = LocalDateTime.of(2024, 1, 15, 10, 0);
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);
        LocalDateTime jan2026 = LocalDateTime.of(2026, 1, 15, 10, 0);

        Workout workout2024 = new Workout(jan2024, jan2024.plusHours(1), testRoutine, testUser);
        workout2024 = workoutDao.save(workout2024);

        Workout workout2025 = new Workout(jan2025, jan2025.plusHours(1), testRoutine, testUser);
        workout2025 = workoutDao.save(workout2025);

        Workout workout2026 = new Workout(jan2026, jan2026.plusHours(1), testRoutine, testUser);
        workout2026 = workoutDao.save(workout2026);

        workoutExerciseDao.save(new WorkoutExercise((short) 10, (short) 50, null, workout2024, routineExerciseWeight));
        workoutExerciseDao.save(new WorkoutExercise((short) 10, (short) 60, null, workout2025, routineExerciseWeight));
        workoutExerciseDao.save(new WorkoutExercise((short) 10, (short) 70, null, workout2026, routineExerciseWeight));

        Long totalWeight2025 = wrappedService.calculateYearlyTotalWeight(testUser.getId(), 2025);

        assertEquals(600L, totalWeight2025);
    }

    @Test
    void testCalculateYearlyTotalWeight_NoWorkouts() throws InstanceNotFoundException {
        Long totalWeight = wrappedService.calculateYearlyTotalWeight(testUser.getId(), 2025);
        assertEquals(0L, totalWeight);
    }

    @Test
    void testCalculateYearlyTotalWeight_UserNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            wrappedService.calculateYearlyTotalWeight(999L, 2025);
        });
    }

    @Test
    void testGetWeightComparison_SmallWeight() throws InstanceNotFoundException {
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);
        Workout workout = new Workout(jan2025, jan2025.plusHours(1), testRoutine, testUser);
        workout = workoutDao.save(workout);

        WorkoutExercise we = new WorkoutExercise((short) 5, (short) 10, null, workout, routineExerciseWeight);
        workoutExerciseDao.save(we);

        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);

        assertEquals(50L, result.getTotalWeightKg());
        assertTrue(result.getComparisonPhrase().contains("perro grande") ||
                result.getComparisonPhrase().contains("gato"));
    }

    @Test
    void testGetWeightComparison_ElephantWeight() throws InstanceNotFoundException {
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);
        Workout workout = new Workout(jan2025, jan2025.plusHours(1), testRoutine, testUser);
        workout = workoutDao.save(workout);

        WorkoutExercise we = new WorkoutExercise((short) 100, (short) 60, null, workout, routineExerciseWeight);
        workoutExerciseDao.save(we);

        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);

        assertEquals(6000L, result.getTotalWeightKg());
        assertTrue(result.getComparisonPhrase().contains("elefante"));
    }

    @Test
    void testGetWeightComparison_NoWeight() throws InstanceNotFoundException {
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);

        assertEquals(0L, result.getTotalWeightKg());
        assertNotNull(result.getComparisonPhrase());
    }

    private void createWorkoutWithWeight(long totalWeight) {
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);
        Workout workout = new Workout(jan2025, jan2025.plusHours(1), testRoutine, testUser);
        workout = workoutDao.save(workout);

        long remaining = totalWeight;
        while (remaining > 0) {
            long exerciseTotal = Math.min(remaining, 3000);

            short reps = 10;
            short weight = (short) (exerciseTotal / reps);
            long actualTotal = (long) reps * weight;

            if (actualTotal < exerciseTotal && exerciseTotal - actualTotal < 10) {
                short diff = (short) (exerciseTotal - actualTotal);
                reps = diff;
                weight = 1;
            }

            WorkoutExercise we = new WorkoutExercise(reps, weight, null, workout, routineExerciseWeight);
            workoutExerciseDao.save(we);

            remaining -= (long) reps * weight;
        }
    }

    @ParameterizedTest
    @MethodSource("exactWeightComparisonTestCases")
    void testReference_Exact(long weight, String expectedPhrase) throws InstanceNotFoundException {
        createWorkoutWithWeight(weight);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertEquals(weight, result.getTotalWeightKg());
        assertTrue(result.getComparisonPhrase().contains(expectedPhrase));
        if (weight == 4L) {
            assertTrue(result.getComparisonPhrase().contains("un"));
        }
    }

    @Test
    void testReference_LargeDog_Fractional() throws InstanceNotFoundException {
        createWorkoutWithWeight(40L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getTotalWeightKg() >= 40L && result.getTotalWeightKg() <= 50L);
        assertTrue(result.getComparisonPhrase().contains("perro"));
    }

    @Test
    void testReference_Person_Fractional() throws InstanceNotFoundException {
        createWorkoutWithWeight(100L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getTotalWeightKg() >= 100L && result.getTotalWeightKg() <= 110L);
        assertTrue(result.getComparisonPhrase().contains("persona"));
    }

    @Test
    void testReference_Horse_Fractional() throws InstanceNotFoundException {
        createWorkoutWithWeight(650L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getTotalWeightKg() >= 650L && result.getTotalWeightKg() <= 660L);
        assertTrue(result.getComparisonPhrase().contains("caballo"));
    }

    @Test
    void testReference_SmallCar_Fractional() throws InstanceNotFoundException {
        createWorkoutWithWeight(1800L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getTotalWeightKg() >= 1800L && result.getTotalWeightKg() <= 1810L);
        assertTrue(result.getComparisonPhrase().contains("coche"));
    }

    @Test
    void testReference_Elephant_Fractional() throws InstanceNotFoundException {
        createWorkoutWithWeight(6000L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getTotalWeightKg() >= 6000L && result.getTotalWeightKg() <= 6010L);
        assertTrue(result.getComparisonPhrase().contains("elefante"));
    }

    @Test
    void testReference_BlueWhale_Fractional() throws InstanceNotFoundException {
        createWorkoutWithWeight(200000L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getTotalWeightKg() >= 200000L && result.getTotalWeightKg() <= 200010L);
        assertTrue(result.getComparisonPhrase().contains("ballena"));
    }

    @Test
    void testReference_Boeing747_Multiple() throws InstanceNotFoundException {
        createWorkoutWithWeight(800000L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertEquals(800000L, result.getTotalWeightKg());
        assertTrue(result.getComparisonPhrase().contains("Boeing"));
    }

    @Test
    void testReference_BoundaryTransition_CatToDog() throws InstanceNotFoundException {
        createWorkoutWithWeight(29L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getComparisonPhrase().contains("gato"));

        createWorkoutWithWeight(31L);
        result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getComparisonPhrase().contains("perro"));
    }

    @Test
    void testReference_BoundaryTransition_DogToPerson() throws InstanceNotFoundException {
        createWorkoutWithWeight(69L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getComparisonPhrase().contains("perro"));

        createWorkoutWithWeight(71L);
        result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getComparisonPhrase().contains("persona"));
    }

    @Test
    void testReference_BoundaryTransition_HorseToCar() throws InstanceNotFoundException {
        createWorkoutWithWeight(1100L);
        WeightComparisonDto result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getComparisonPhrase().contains("caballo"), "1100kg should use Horse reference");

        User user2 = new User("Test2", "User2", "test2@example.com", "600000009",
                passwordEncoder.encode("password"), User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user2 = userDao.save(user2);

        testUser = user2;
        createWorkoutWithWeight(1300L);
        result = wrappedService.getWeightComparison(testUser.getId(), 2025);
        assertTrue(result.getComparisonPhrase().contains("coche"), "1300kg should use Car reference");
    }

    @Test
    void testGetLongestStreak_NoWorkouts() throws InstanceNotFoundException {
        Integer streak = wrappedService.getLongestStreak(testUser.getId(), 2025);
        assertEquals(0, streak);
    }

    @Test
    void testGetLongestStreak_SingleWorkout() throws InstanceNotFoundException {
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);
        Workout workout = new Workout(jan2025, jan2025.plusHours(1), testRoutine, testUser);
        workoutDao.save(workout);

        Integer streak = wrappedService.getLongestStreak(testUser.getId(), 2025);
        assertEquals(1, streak);
    }

    @Test
    void testGetLongestStreak_ConsecutiveDays() throws InstanceNotFoundException {
        LocalDateTime day1 = LocalDateTime.of(2025, 1, 15, 10, 0);
        LocalDateTime day2 = LocalDateTime.of(2025, 1, 16, 10, 0);
        LocalDateTime day3 = LocalDateTime.of(2025, 1, 17, 10, 0);

        workoutDao.save(new Workout(day1, day1.plusHours(1), testRoutine, testUser));
        workoutDao.save(new Workout(day2, day2.plusHours(1), testRoutine, testUser));
        workoutDao.save(new Workout(day3, day3.plusHours(1), testRoutine, testUser));

        Integer streak = wrappedService.getLongestStreak(testUser.getId(), 2025);
        assertEquals(3, streak);
    }

    @Test
    void testGetLongestStreak_NonConsecutiveDays() throws InstanceNotFoundException {
        LocalDateTime day1 = LocalDateTime.of(2025, 1, 10, 10, 0);
        LocalDateTime day2 = LocalDateTime.of(2025, 1, 15, 10, 0);
        LocalDateTime day3 = LocalDateTime.of(2025, 1, 20, 10, 0);

        workoutDao.save(new Workout(day1, day1.plusHours(1), testRoutine, testUser));
        workoutDao.save(new Workout(day2, day2.plusHours(1), testRoutine, testUser));
        workoutDao.save(new Workout(day3, day3.plusHours(1), testRoutine, testUser));

        Integer streak = wrappedService.getLongestStreak(testUser.getId(), 2025);
        assertEquals(1, streak);
    }

    @Test
    void testGetLongestStreak_UserNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            wrappedService.getLongestStreak(999L, 2025);
        });
    }
    
    @Test
    void testGetTopExercisesByUser() {
        Long userId = 2L;
        LinkedHashMap<Exercise, Long> topExercises = wrappedService.getTopExercisesByUser(userId);

        assertEquals(5, topExercises.size());

        boolean contieneSentadillas = topExercises.keySet().stream()
                .anyMatch(e -> e.getName().equals("Sentadillas"));
        assertTrue(contieneSentadillas);
        topExercises.values().forEach(count -> assertTrue(count > 0));
    }

    @Test
    void testGetFavouriteMuscleGroup() {
        Long userId = 2L;
        String favMuscleGroup = wrappedService.getFavouriteMuscleGroup(userId);
        assertEquals("CHEST", favMuscleGroup);
    }

    @Test
    void testGetFavouriteRoutine() {
        Long userId = 2L;
        Map.Entry<Routine, Long> result = wrappedService.getFavouriteRoutine(userId);
        assertEquals("Rutina fuerza inicial", result.getKey().getName());
        assertTrue(result.getValue() > 0);
    }
}
