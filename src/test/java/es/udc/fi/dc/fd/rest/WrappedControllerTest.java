package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class WrappedControllerTest {

    private static final String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

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
    private UserController userController;

    private AuthenticatedUserDto testUser;
    private Routine testRoutine;
    private Exercise weightExercise;
    private RoutineExercise routineExerciseWeight;

    @BeforeEach
    void setUp() throws IncorrectLoginException, BlockedUserException {
        testUser = createAuthenticatedUser("Test", "User", "testuser@example.com", "600000001");

        User user = userDao.findById(testUser.getUserDto().getId()).orElseThrow();

        testRoutine = new Routine("Test Routine", "Description", Routine.VisibilityType.PUBLIC,
                Routine.DifficultyType.BEGINNER, user);
        testRoutine = routineDao.save(testRoutine);

        weightExercise = new Exercise("Squats", "Leg exercise", Exercise.MuscleGroup.LEG,
                Exercise.Equipment.NONE, new byte[]{1, 2, 3}, Exercise.ExerciseStatus.APPROVED,
                user);
        weightExercise = exerciseDao.save(weightExercise);

        routineExerciseWeight = new RoutineExercise(testRoutine, weightExercise, RoutineExercise.ExerciseType.STRENGTH, 1);
        routineExerciseWeight = routineExerciseDao.save(routineExerciseWeight);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email,
                                                         String phoneNumber)
            throws IncorrectLoginException, BlockedUserException {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, User.RoleType.CLIENT,
                User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    @Test
    void testGetWeightComparison_WithWorkouts() throws Exception {
        User user = userDao.findById(testUser.getUserDto().getId()).orElseThrow();
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);

        Workout workout = new Workout(jan2025, jan2025.plusHours(1), testRoutine, user);
        workout = workoutDao.save(workout);

        WorkoutExercise we = new WorkoutExercise((short) 10, (short) 50, null, workout, routineExerciseWeight);
        workoutExerciseDao.save(we);

        mockMvc.perform(get("/api/wrapped/weight-comparison")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWeightKg").value(500))
                .andExpect(jsonPath("$.comparisonPhrase").exists())
                .andExpect(jsonPath("$.comparisonPhrase").isString());
    }

    @Test
    void testGetWeightComparison_NoWorkouts() throws Exception {
        mockMvc.perform(get("/api/wrapped/weight-comparison")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWeightKg").value(0))
                .andExpect(jsonPath("$.comparisonPhrase").exists());
    }

    @Test
    void testGetWeightComparison_WithYearParameter() throws Exception {
        User user = userDao.findById(testUser.getUserDto().getId()).orElseThrow();
        LocalDateTime jan2024 = LocalDateTime.of(2024, 1, 15, 10, 0);
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);

        Workout workout2024 = new Workout(jan2024, jan2024.plusHours(1), testRoutine, user);
        workout2024 = workoutDao.save(workout2024);

        Workout workout2025 = new Workout(jan2025, jan2025.plusHours(1), testRoutine, user);
        workout2025 = workoutDao.save(workout2025);

        workoutExerciseDao.save(
                new WorkoutExercise((short) 10, (short) 50, null, workout2024, routineExerciseWeight));

        workoutExerciseDao.save(
                new WorkoutExercise((short) 10, (short) 60, null, workout2025, routineExerciseWeight));

        mockMvc.perform(get("/api/wrapped/weight-comparison")
                        .param("year", "2024")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWeightKg").value(500));

        mockMvc.perform(get("/api/wrapped/weight-comparison")
                        .param("year", "2025")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWeightKg").value(600));
    }

    @Test
    void testGetWeightComparison_DefaultsToCurrentYear() throws Exception {
        User user = userDao.findById(testUser.getUserDto().getId()).orElseThrow();
        LocalDateTime now = LocalDateTime.now();

        Workout workout = new Workout(now, now.plusHours(1), testRoutine, user);
        workout = workoutDao.save(workout);

        workoutExerciseDao.save(
                new WorkoutExercise((short) 10, (short) 50, null, workout, routineExerciseWeight));

        mockMvc.perform(get("/api/wrapped/weight-comparison")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWeightKg").value(500));
    }

    @Test
    void testGetWeightComparison_RequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/wrapped/weight-comparison"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetWeightComparison_LargeWeight() throws Exception {
        User user = userDao.findById(testUser.getUserDto().getId()).orElseThrow();
        LocalDateTime jan2025 = LocalDateTime.of(2025, 1, 15, 10, 0);

        for (int i = 0; i < 10; i++) {
            Workout workout = new Workout(jan2025.plusDays(i), jan2025.plusDays(i).plusHours(1),
                    testRoutine, user);
            workout = workoutDao.save(workout);
            workoutExerciseDao
                    .save(new WorkoutExercise((short) 100, (short) 100, null, workout,
                            routineExerciseWeight));
        }

        mockMvc.perform(get("/api/wrapped/weight-comparison")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWeightKg").value(100000))
                .andExpect(jsonPath("$.comparisonPhrase").exists());
    }

    @Test
    void testGetLongestStreak_WithWorkouts() throws Exception {
        User user = userDao.findById(testUser.getUserDto().getId()).orElseThrow();
        LocalDateTime day1 = LocalDateTime.of(2025, 1, 15, 10, 0);
        LocalDateTime day2 = LocalDateTime.of(2025, 1, 16, 10, 0);
        LocalDateTime day3 = LocalDateTime.of(2025, 1, 17, 10, 0);

        workoutDao.save(new Workout(day1, day1.plusHours(1), testRoutine, user));
        workoutDao.save(new Workout(day2, day2.plusHours(1), testRoutine, user));
        workoutDao.save(new Workout(day3, day3.plusHours(1), testRoutine, user));

        mockMvc.perform(get("/api/wrapped/longest-streak")
                        .param("year", "2025")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(3));
    }

    @Test
    void testGetLongestStreak_NoWorkouts() throws Exception {
        mockMvc.perform(get("/api/wrapped/longest-streak")
                        .param("year", "2025")
                        .header("Authorization", "Bearer " + testUser.getServiceToken())
                        .header("X-User-Id", testUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(0));
    }

    @Test
    void testGetLongestStreak_RequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/wrapped/longest-streak"))
                .andExpect(status().isForbidden());
    }
}
