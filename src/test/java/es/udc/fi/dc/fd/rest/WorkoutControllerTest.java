package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.RoutineDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.WorkoutDao;
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

import static es.udc.fi.dc.fd.model.entities.User.RoleType;
import static es.udc.fi.dc.fd.model.entities.Routine.VisibilityType;
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
    private UserController userController;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;
    private Routine routine;

    @BeforeEach
    public void setUp() throws IncorrectLoginException {
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002", User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000004", RoleType.CLIENT);

        final User trainer = new User("Trainer", "Two", "trainer2@test.com", "600000003", "1234", null, User.RoleType.TRAINER, User.StatusType.ACTIVE);
        userDao.save(trainer);

        routine = new Routine("Name", "Description", VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER, trainer);
        routineDao.save(routine);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email,
                                                         String phoneNumber, RoleType roleType)
            throws IncorrectLoginException {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, null, roleType, User.StatusType.ACTIVE);
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
    public void testGetWorkoutsAsTrainer() throws Exception {
        startWorkout(trainerUser, routine.getId()).andExpect(status().isOk());
        startWorkout(trainerUser, routine.getId()).andExpect(status().isOk());

        getUserWorkouts(trainerUser)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
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
    public void testGetWorkoutsEmpty() throws Exception {
        getUserWorkouts(trainerUser)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

}
