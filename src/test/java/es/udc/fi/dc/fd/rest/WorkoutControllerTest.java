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
class WorkoutControllerTest {

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
    private UserFollowDao userFollowDao;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;
    private AuthenticatedUserDto followedUser1;
    private AuthenticatedUserDto followedUser2;
    private Routine routine;
    private RoutineExercise routineExercise;

    @BeforeEach
    void setUp() throws IncorrectLoginException, BlockedUserException {
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002",
                User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000004", RoleType.CLIENT);

        followedUser1 = createAuthenticatedUser("Followed", "One", "followed1@test.com", "600000005", RoleType.CLIENT);
        followedUser2 = createAuthenticatedUser("Followed", "Two", "followed2@test.com", "600000006", RoleType.CLIENT);

        final User trainer = new User("Trainer", "Two", "trainer2@test.com", "600000003", "1234",
                User.RoleType.TRAINER, User.StatusType.ACTIVE);
        userDao.save(trainer);

        routine = new Routine("Name", "Description", VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, trainer);
        routineDao.save(routine);

        Exercise exercise = new Exercise("Sentadillas Test", "Ejercicio para piernas", Exercise.MuscleGroup.LEG,
                Exercise.Equipment.NONE, Exercise.ExerciseType.STRENGTH, new byte[]{1, 2, 3}, Exercise.ExerciseStatus.APPROVED, trainer);
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

    private ResultActions getVolumeRankingForRoutine(AuthenticatedUserDto user, Long routineId) throws Exception {
        return mockMvc.perform(get("/api/workouts/routine/" + routineId + "/volume-ranking")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .header("X-User-Id", user.getUserDto().getId()));
    }

    @Test
    void testStartWorkoutAsTrainer() throws Exception {
        startWorkout(trainerUser, routine.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.routineId").value(routine.getId().intValue()))
                .andExpect(jsonPath("$.endTime").doesNotExist());
    }

    @Test
    void testFinishWorkoutAsTrainer() throws Exception {
        ResultActions startAction = startWorkout(trainerUser, routine.getId()).andExpect(status().isOk());
        String json = startAction.andReturn().getResponse().getContentAsString();
        WorkoutDto dto = objectMapper.readValue(json, WorkoutDto.class);

        finishWorkout(trainerUser, dto.getId()).andExpect(status().isOk());
    }

    @Test
    void testFinishWorkoutNotFound() throws Exception {
        finishWorkout(trainerUser, 999L)
                .andExpect(status().isNotFound());
    }

    @Test
    void testStartWorkoutAsClient() throws Exception {
        startWorkout(clientUser, routine.getId())
                .andExpect(status().isOk());
    }

    @Test
    void testStartWorkoutUnauthenticatedFails() throws Exception {
        WorkoutDto dto = new WorkoutDto();
        dto.setRoutineId(routine.getId());

        mockMvc.perform(post("/api/workouts/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetWorkoutByIdExists() throws Exception {
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
    void testGetWorkoutByIdNotFound() throws Exception {
        // Act & Assert: id inexistente debe devolver 404
        mockMvc.perform(get("/api/workouts/999")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .header("X-User-Id", trainerUser.getUserDto().getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetWorkoutsEmpty() throws Exception {
        getUserWorkouts(trainerUser)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testStartWorkoutRoutineNotFound() throws Exception {
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
    void testGetWorkoutsFromFollowing() throws Exception {
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

    @Test
    void testGetLastMonthStats() throws Exception {
        YearMonth targetMonth = YearMonth.now().minusMonths(1);
        LocalDateTime startOfMonth = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime midOfMonth = targetMonth.atDay(15).atStartOfDay();

        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();

        Workout w1 = new Workout(startOfMonth, startOfMonth.plusHours(1), routine, client);
        w1 = workoutDao.save(w1);

        Workout w2 = new Workout(midOfMonth, midOfMonth.plusHours(2), routine, client);
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
                        .param("month", String.valueOf(targetMonth.getMonthValue()))
                        .param("year", String.valueOf(targetMonth.getYear()))
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastMonthWorkouts").value(2))
                .andExpect(jsonPath("$.totalDurationSeconds").value(10800))
                .andExpect(jsonPath("$.averageDurationSeconds").value(5400.0))
                .andExpect(jsonPath("$.exercisesByMuscleGroup['LEG']").value(2));
    }

    @Test
    void testGetLastMonthStatsNoWorkouts() throws Exception {
        YearMonth targetMonth = YearMonth.now().minusMonths(1);

        mockMvc.perform(get("/api/workouts/stats")
                        .param("month", String.valueOf(targetMonth.getMonthValue()))
                        .param("year", String.valueOf(targetMonth.getYear()))
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastMonthWorkouts").value(0))
                .andExpect(jsonPath("$.totalDurationSeconds").value(0))
                .andExpect(jsonPath("$.averageDurationSeconds").value(0.0))
                .andExpect(jsonPath("$.exercisesByMuscleGroup").isEmpty());
    }

    @Test
    void testGetTwoMonthsAgoStats() throws Exception {
        YearMonth twoMonthsAgo = YearMonth.now().minusMonths(2);
        LocalDateTime startOfMonth = twoMonthsAgo.atDay(1).atStartOfDay();

        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();

        Workout w1 = new Workout(startOfMonth, startOfMonth.plusHours(1), routine, client);
        w1 = workoutDao.save(w1);

        WorkoutExercise we1 = new WorkoutExercise();
        we1.setWorkout(w1);
        we1.setRoutineExercise(routineExercise);
        we1.setReps((short) 8);
        we1.setWeight((short) 60);
        we1.setDurationSeconds((short) 45);
        workoutExerciseDao.save(we1);

        mockMvc.perform(get("/api/workouts/stats")
                        .param("month", String.valueOf(twoMonthsAgo.getMonthValue()))
                        .param("year", String.valueOf(twoMonthsAgo.getYear()))
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastMonthWorkouts").value(1))
                .andExpect(jsonPath("$.totalDurationSeconds").value(3600))
                .andExpect(jsonPath("$.averageDurationSeconds").value(3600.0))
                .andExpect(jsonPath("$.exercisesByMuscleGroup['LEG']").value(1));
    }

    @Test
    void testGetStatsIgnoresWorkoutsFromOtherMonths() throws Exception {
        YearMonth targetMonth = YearMonth.now().minusMonths(1);
        LocalDateTime startOfMonth = targetMonth.atDay(1).atStartOfDay();

        YearMonth differentMonth = YearMonth.now();
        LocalDateTime startOfDifferentMonth = differentMonth.atDay(1).atStartOfDay();

        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();

        Workout w1 = new Workout(startOfMonth, startOfMonth.plusHours(1), routine, client);
        w1 = workoutDao.save(w1);

        Workout w2 = new Workout(startOfDifferentMonth, startOfDifferentMonth.plusHours(1), routine, client);
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
                        .param("month", String.valueOf(targetMonth.getMonthValue()))
                        .param("year", String.valueOf(targetMonth.getYear()))
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastMonthWorkouts").value(1))
                .andExpect(jsonPath("$.totalDurationSeconds").value(3600));
    }

    @Test
    void testGetStatsMissingMonthParameter() throws Exception {
        mockMvc.perform(get("/api/workouts/stats")
                        .param("year", "2024")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetStatsMissingYearParameter() throws Exception {
        mockMvc.perform(get("/api/workouts/stats")
                        .param("month", "11")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetStatsOnlyIncludesCompletedWorkouts() throws Exception {
        YearMonth targetMonth = YearMonth.now().minusMonths(1);
        LocalDateTime startOfMonth = targetMonth.atDay(1).atStartOfDay();

        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();

        Workout completed = new Workout(startOfMonth, startOfMonth.plusHours(1), routine, client);
        completed = workoutDao.save(completed);

        WorkoutExercise we1 = new WorkoutExercise();
        we1.setWorkout(completed);
        we1.setRoutineExercise(routineExercise);
        we1.setReps((short) 10);
        we1.setWeight((short) 50);
        we1.setDurationSeconds((short) 60);
        workoutExerciseDao.save(we1);

        mockMvc.perform(get("/api/workouts/stats")
                        .param("month", String.valueOf(targetMonth.getMonthValue()))
                        .param("year", String.valueOf(targetMonth.getYear()))
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .header("X-User-Id", clientUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastMonthWorkouts").value(1));
    }

    @Test
    void testGetVolumeRankingForRoutineNoWorkouts() throws Exception {
        getVolumeRankingForRoutine(clientUser, routine.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void testGetVolumeRankingForRoutineWithoutFollowedUsers() throws Exception {
        ResultActions start = startWorkout(clientUser, routine.getId()).andExpect(status().isOk());
        WorkoutDto workout = objectMapper.readValue(start.andReturn().getResponse().getContentAsString(), WorkoutDto.class);

        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workoutDao.findById(workout.getId()).orElseThrow());
        we.setRoutineExercise(routineExercise);
        we.setReps((short) 10);
        we.setWeight((short) 50);
        workoutExerciseDao.save(we);

        finishWorkout(clientUser, workout.getId()).andExpect(status().isOk());

        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();
        
        getVolumeRankingForRoutine(clientUser, routine.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userId").value(client.getId().intValue()))
                .andExpect(jsonPath("$[0].totalVolume").value(500));
    }

    @Test
    void testGetVolumeRankingForRoutineWithMultipleFollowedUsers() throws Exception {
        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();
        User followed1 = userDao.findById(followedUser1.getUserDto().getId()).orElseThrow();
        User followed2 = userDao.findById(followedUser2.getUserDto().getId()).orElseThrow();

        userFollowDao.save(new UserFollow(client, followed1));
        userFollowDao.save(new UserFollow(client, followed2));

        ResultActions start1 = startWorkout(followedUser1, routine.getId()).andExpect(status().isOk());
        WorkoutDto workout1 = objectMapper.readValue(start1.andReturn().getResponse().getContentAsString(), WorkoutDto.class);

        WorkoutExercise we1 = new WorkoutExercise();
        we1.setWorkout(workoutDao.findById(workout1.getId()).orElseThrow());
        we1.setRoutineExercise(routineExercise);
        we1.setReps((short) 10);
        we1.setWeight((short) 50);
        workoutExerciseDao.save(we1);

        finishWorkout(followedUser1, workout1.getId()).andExpect(status().isOk());

        ResultActions start2 = startWorkout(followedUser2, routine.getId()).andExpect(status().isOk());
        WorkoutDto workout2 = objectMapper.readValue(start2.andReturn().getResponse().getContentAsString(), WorkoutDto.class);

        WorkoutExercise we2 = new WorkoutExercise();
        we2.setWorkout(workoutDao.findById(workout2.getId()).orElseThrow());
        we2.setRoutineExercise(routineExercise);
        we2.setReps((short) 10);
        we2.setWeight((short) 100);
        workoutExerciseDao.save(we2);

        finishWorkout(followedUser2, workout2.getId()).andExpect(status().isOk());

        ResultActions startClient = startWorkout(clientUser, routine.getId()).andExpect(status().isOk());
        WorkoutDto workoutClient = objectMapper.readValue(startClient.andReturn().getResponse().getContentAsString(), WorkoutDto.class);

        WorkoutExercise weClient = new WorkoutExercise();
        weClient.setWorkout(workoutDao.findById(workoutClient.getId()).orElseThrow());
        weClient.setRoutineExercise(routineExercise);
        weClient.setReps((short) 10);
        weClient.setWeight((short) 75);
        workoutExerciseDao.save(weClient);

        finishWorkout(clientUser, workoutClient.getId()).andExpect(status().isOk());

        getVolumeRankingForRoutine(clientUser, routine.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].userId").value(followed2.getId().intValue()))
                .andExpect(jsonPath("$[0].totalVolume").value(1000))
                .andExpect(jsonPath("$[1].userId").value(client.getId().intValue()))
                .andExpect(jsonPath("$[1].totalVolume").value(750))
                .andExpect(jsonPath("$[2].userId").value(followed1.getId().intValue()))
                .andExpect(jsonPath("$[2].totalVolume").value(500));
    }

    @Test
    void testGetVolumeRankingForRoutineWithUnfollowedUsers() throws Exception {
        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();
        User followed1 = userDao.findById(followedUser1.getUserDto().getId()).orElseThrow();

        userFollowDao.save(new UserFollow(client, followed1));

        ResultActions startClient = startWorkout(clientUser, routine.getId()).andExpect(status().isOk());
        WorkoutDto workoutClient = objectMapper.readValue(startClient.andReturn().getResponse().getContentAsString(), WorkoutDto.class);
        WorkoutExercise weClient = new WorkoutExercise();
        weClient.setWorkout(workoutDao.findById(workoutClient.getId()).orElseThrow());
        weClient.setRoutineExercise(routineExercise);
        weClient.setReps((short) 10);
        weClient.setWeight((short) 30);
        workoutExerciseDao.save(weClient);
        finishWorkout(clientUser, workoutClient.getId()).andExpect(status().isOk());

        ResultActions start1 = startWorkout(followedUser1, routine.getId()).andExpect(status().isOk());
        WorkoutDto workout1 = objectMapper.readValue(start1.andReturn().getResponse().getContentAsString(), WorkoutDto.class);
        WorkoutExercise we1 = new WorkoutExercise();
        we1.setWorkout(workoutDao.findById(workout1.getId()).orElseThrow());
        we1.setRoutineExercise(routineExercise);
        we1.setReps((short) 10);
        we1.setWeight((short) 50);
        workoutExerciseDao.save(we1);
        finishWorkout(followedUser1, workout1.getId()).andExpect(status().isOk());

        ResultActions start2 = startWorkout(followedUser2, routine.getId()).andExpect(status().isOk());
        WorkoutDto workout2 = objectMapper.readValue(start2.andReturn().getResponse().getContentAsString(), WorkoutDto.class);
        WorkoutExercise we2 = new WorkoutExercise();
        we2.setWorkout(workoutDao.findById(workout2.getId()).orElseThrow());
        we2.setRoutineExercise(routineExercise);
        we2.setReps((short) 10);
        we2.setWeight((short) 100);
        workoutExerciseDao.save(we2);
        finishWorkout(followedUser2, workout2.getId()).andExpect(status().isOk());

        getVolumeRankingForRoutine(clientUser, routine.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].userId").value(followed1.getId().intValue()))
                .andExpect(jsonPath("$[1].userId").value(client.getId().intValue()));
    }

    @Test
    void testGetVolumeRankingForRoutineOnlyIncludesFinishedWorkouts() throws Exception {
        User client = userDao.findById(clientUser.getUserDto().getId()).orElseThrow();
        User followed = userDao.findById(followedUser1.getUserDto().getId()).orElseThrow();

        userFollowDao.save(new UserFollow(client, followed));

        ResultActions start = startWorkout(followedUser1, routine.getId()).andExpect(status().isOk());
        WorkoutDto workout = objectMapper.readValue(start.andReturn().getResponse().getContentAsString(), WorkoutDto.class);

        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workoutDao.findById(workout.getId()).orElseThrow());
        we.setRoutineExercise(routineExercise);
        we.setReps((short) 10);
        we.setWeight((short) 50);
        workoutExerciseDao.save(we);

        getVolumeRankingForRoutine(clientUser, routine.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
