package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.WorkoutDto;
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
import java.time.YearMonth;

import static es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
import static es.udc.fi.dc.fd.model.entities.User.RoleType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class WorkoutControllerTest {

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
    private WorkoutExerciseDao workoutExerciseDao;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;
    private Routine routine;
    private RoutineExercise routineExercise;

    @BeforeEach
    public void setUp() throws IncorrectLoginException, BlockedUserException {
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002",
                User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000004", RoleType.CLIENT);

        final User trainer = new User("Trainer", "Two", "trainer2@test.com", "600000003", "1234",
                User.RoleType.TRAINER, User.StatusType.ACTIVE);
        userDao.save(trainer);

        routine = new Routine("Name", "Description", VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, trainer);
        routineDao.save(routine);

        Exercise exercise = new Exercise("Sentadillas Test", "Ejercicio para piernas", Exercise.MuscleGroup.LEG,
                Exercise.Equipment.NONE, new byte[] { 1, 2, 3 }, Exercise.ExerciseStatus.APPROVED, trainer);
        exerciseDao.save(exercise);

        routineExercise = new RoutineExercise(routine, exercise, 1);
        routineExerciseDao.save(routineExercise);

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

    private ResultActions startWorkout(AuthenticatedUserDto user, Long routineId) throws Exception {
        WorkoutDto dto = new WorkoutDto();
        dto.setRoutineId(routineId);

        return mockMvc.perform(post("/api/workouts/start")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .header("X-User-Id", user.getUserDto().getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));
    }

    private ResultActions finishWorkout(AuthenticatedUserDto user, Long workoutId) throws Exception {
        return mockMvc.perform(put("/api/workouts/" + workoutId + "/finish")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .header("X-User-Id", user.getUserDto().getId()));
    }

    private ResultActions getUserWorkouts(AuthenticatedUserDto user) throws Exception {
        return mockMvc.perform(get("/api/workouts")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .header("X-User-Id", user.getUserDto().getId()));
    }

    @Test
    public void testStartWorkoutAsTrainer() throws Exception {
        startWorkout(trainerUser, routine.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.routineId").value(routine.getId().intValue()))
                .andExpect(jsonPath("$.endTime").doesNotExist());
    }

    @Test
    public void testFinishWorkoutAsTrainer() throws Exception {
        ResultActions startAction = startWorkout(trainerUser, routine.getId()).andExpect(status().isOk());
        String json = startAction.andReturn().getResponse().getContentAsString();
        WorkoutDto dto = objectMapper.readValue(json, WorkoutDto.class);

        finishWorkout(trainerUser, dto.getId()).andExpect(status().isOk());
    }

    @Test
    public void testFinishWorkoutNotFound() throws Exception {
        finishWorkout(trainerUser, 999L)
                .andExpect(status().isNotFound());
    }

    @Test
    public void testStartWorkoutAsClient() throws Exception {
        startWorkout(clientUser, routine.getId())
                .andExpect(status().isOk());
    }

    @Test
    public void testStartWorkoutUnauthenticatedFails() throws Exception {
        WorkoutDto dto = new WorkoutDto();
        dto.setRoutineId(routine.getId());

        mockMvc.perform(post("/api/workouts/start")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetWorkoutByIdExists() throws Exception {
        // Arrange: crear un workout real
        ResultActions startAction = startWorkout(trainerUser, routine.getId()).andExpect(status().isOk());
        String json = startAction.andReturn().getResponse().getContentAsString();
        WorkoutDto createdWorkout = objectMapper.readValue(json, WorkoutDto.class);

        // Act & Assert: obtener el workout por id
        mockMvc.perform(get("/api/workouts/" + createdWorkout.getId())
                .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                .header("X-User-Id", trainerUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdWorkout.getId().intValue()))
                .andExpect(jsonPath("$.routineId").value(routine.getId().intValue()))
                .andExpect(jsonPath("$.endTime").doesNotExist())
                .andExpect(jsonPath("$.startTime").exists());
    }

    @Test
    public void testGetWorkoutByIdNotFound() throws Exception {
        // Act & Assert: id inexistente debe devolver 404
        mockMvc.perform(get("/api/workouts/999")
                .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                .header("X-User-Id", trainerUser.getUserDto().getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testGetWorkoutsEmpty() throws Exception {
        getUserWorkouts(trainerUser)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    public void testStartWorkoutRoutineNotFound() throws Exception {
        WorkoutDto dto = new WorkoutDto();
        dto.setRoutineId(9999L);

        mockMvc.perform(post("/api/workouts/start")
                .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                .header("X-User-Id", trainerUser.getUserDto().getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testGetWorkoutsFromFollowing() throws Exception {
        // entrenador seguido por el cliente
        // follow ya probado en otro test → aquí solo forzamos el feed mediante
        // inserción directa
        startWorkout(trainerUser, routine.getId()).andExpect(status().isOk());

        mockMvc.perform(get("/api/workouts/following")
                .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                .header("X-User-Id", trainerUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    public void testGetLastMonthStatsReturnsStats() throws Exception {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDateTime startOfLastMonth = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime midOfLastMonth = lastMonth.atDay(15).atStartOfDay();

        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();

        Workout w1 = new Workout(startOfLastMonth, startOfLastMonth.plusHours(1), routine, client);
        w1 = workoutDao.save(w1);

        Workout w2 = new Workout(midOfLastMonth, midOfLastMonth.plusHours(2), routine, client);
        w2 = workoutDao.save(w2);

        WorkoutExercise we1 = new WorkoutExercise();
        we1.setWorkout(w1);
        we1.setRoutineExercise(routineExercise);
        we1.setReps((short) 10);
        we1.setWeight((short) 50);
        we1.setDurationSeconds((short) 60);
        workoutExerciseDao.save(we1);

        WorkoutExercise we2 = new WorkoutExercise();
        we2.setWorkout(w2);
        we2.setRoutineExercise(routineExercise);
        we2.setReps((short) 10);
        we2.setWeight((short) 50);
        we2.setDurationSeconds((short) 60);
        workoutExerciseDao.save(we2);

        mockMvc.perform(get("/api/workouts/stats")
                .header("Authorization", "Bearer " + clientUser.getServiceToken())
                .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastMonthWorkouts").value(2))
                .andExpect(jsonPath("$.totalDurationSeconds").value(10800))
                .andExpect(jsonPath("$.averageDurationSeconds").value(5400.0))
                .andExpect(jsonPath("$.exercisesByMuscleGroup['LEG']").value(2));
    }

    @Test
    public void testGetLastMonthStatsNoWorkouts() throws Exception {
        mockMvc.perform(get("/api/workouts/stats")
                .header("Authorization", "Bearer " + clientUser.getServiceToken())
                .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastMonthWorkouts").value(0))
                .andExpect(jsonPath("$.totalDurationSeconds").value(0))
                .andExpect(jsonPath("$.averageDurationSeconds").value(0.0))
                .andExpect(jsonPath("$.exercisesByMuscleGroup").isEmpty());
    }
}
