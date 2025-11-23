package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.WorkoutExerciseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
import static es.udc.fi.dc.fd.model.entities.User.RoleType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class WorkoutExerciseControllerTest {

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
    private WorkoutDao workoutDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private RoutineExerciseDao routineExerciseDao;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto trainerUser;
    private Routine routine;
    private Exercise exercise;
    private RoutineExercise routineExercise;
    private Workout workout;

    @BeforeEach
    public void setUp() throws IncorrectLoginException, BlockedUserException {
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002", RoleType.TRAINER);

        // Crear rutina
        routine = new Routine("Full Body", "Rutina completa", VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER,
                userDao.findById(trainerUser.getUserDto().getId()).get());
        routineDao.save(routine);

        // Crear ejercicio
        exercise = new Exercise("Sentadillas Test", "Ejercicio básico de piernas", MuscleGroup.LEG, Equipment.BARBELL,
                new byte[] { 1, 2, 3 }, Exercise.ExerciseStatus.APPROVED,
                userDao.findById(trainerUser.getUserDto().getId()).get());
        exerciseDao.save(exercise);

        // Asociar ejercicio a la rutina
        routineExercise = new RoutineExercise(routine, exercise, 1);
        routineExerciseDao.save(routineExercise);

        // Crear un workout
        workout = new Workout(LocalDateTime.now(), null, routine,
                userDao.findById(trainerUser.getUserDto().getId()).get());
        workoutDao.save(workout);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email,
            String phoneNumber, RoleType roleType)
            throws IncorrectLoginException, BlockedUserException {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, roleType, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    private ResultActions addWorkoutExercise(AuthenticatedUserDto user, Long workoutId, WorkoutExerciseDto dto)
            throws Exception {
        return mockMvc.perform(post("/api/workouts/" + workoutId + "/log")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .header("X-User-Id", user.getUserDto().getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));
    }

    private ResultActions getWorkoutExercises(AuthenticatedUserDto user, Long workoutId) throws Exception {
        return mockMvc.perform(get("/api/workouts/" + workoutId + "/log")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .header("X-User-Id", user.getUserDto().getId()));
    }

    // ---------------- TESTS ----------------

    @Test
    public void testAddWorkoutExerciseCreatesLog() throws Exception {
        WorkoutExerciseDto dto = new WorkoutExerciseDto();
        dto.setReps((short) 10);
        dto.setWeight((short) 50);
        dto.setDurationSeconds((short) 60);
        dto.setRoutineExerciseId(routineExercise.getId());

        addWorkoutExercise(trainerUser, workout.getId(), dto)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.reps").value(10))
                .andExpect(jsonPath("$.weight").value(50))
                .andExpect(jsonPath("$.durationSeconds").value(60))
                .andExpect(jsonPath("$.routineExerciseId").value(routineExercise.getId().intValue()));
    }

    @Test
    public void testAddWorkoutExerciseWorkoutNotFound() throws Exception {
        WorkoutExerciseDto dto = new WorkoutExerciseDto();
        dto.setReps((short) 10);
        dto.setWeight((short) 50);
        dto.setDurationSeconds((short) 60);
        dto.setRoutineExerciseId(routineExercise.getId());

        addWorkoutExercise(trainerUser, 999L, dto)
                .andExpect(status().isNotFound());
    }

    @Test
    public void testAddWorkoutExerciseRoutineExerciseNotFound() throws Exception {
        WorkoutExerciseDto dto = new WorkoutExerciseDto();
        dto.setReps((short) 10);
        dto.setWeight((short) 50);
        dto.setDurationSeconds((short) 60);
        dto.setRoutineExerciseId(999L);

        addWorkoutExercise(trainerUser, workout.getId(), dto)
                .andExpect(status().isNotFound());
    }

    @Test
    public void testGetWorkoutExercisesReturnsList() throws Exception {
        WorkoutExerciseDto dto1 = new WorkoutExerciseDto();
        dto1.setReps((short) 10);
        dto1.setWeight((short) 50);
        dto1.setDurationSeconds((short) 60);
        dto1.setRoutineExerciseId(routineExercise.getId());
        addWorkoutExercise(trainerUser, workout.getId(), dto1).andExpect(status().isOk());

        WorkoutExerciseDto dto2 = new WorkoutExerciseDto();
        dto2.setReps((short) 8);
        dto2.setWeight((short) 40);
        dto2.setDurationSeconds((short) 45);
        dto2.setRoutineExerciseId(routineExercise.getId());
        addWorkoutExercise(trainerUser, workout.getId(), dto2).andExpect(status().isOk());

        getWorkoutExercises(trainerUser, workout.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void testGetWorkoutExercisesEmptyList() throws Exception {
        getWorkoutExercises(trainerUser, workout.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    public void testGetWorkoutExercisesWorkoutNotFound() throws Exception {
        getWorkoutExercises(trainerUser, 999L)
                .andExpect(status().isNotFound());
    }

    @Test
    public void testAddWorkoutExerciseUnauthorized() throws Exception {
        WorkoutExerciseDto dto = new WorkoutExerciseDto();
        dto.setReps((short) 10);
        dto.setWeight((short) 50);
        dto.setDurationSeconds((short) 60);
        dto.setRoutineExerciseId(routineExercise.getId());

        mockMvc.perform(post("/api/workouts/" + workout.getId() + "/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }
}
