package es.udc.fi.dc.fd.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ExerciseControllerTest {

    private final static String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserDao userDao;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto adminUser;
    private AuthenticatedUserDto clientUser;
    private AuthenticatedUserDto trainerUser;

    @Before
    public void setUp() throws IncorrectLoginException {
        adminUser = createAuthenticatedUser("Admin", "User", "admin@test.com", "600000001", RoleType.ADMIN);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000002", RoleType.CLIENT);
        trainerUser = createAuthenticatedUser("Trainer", "User", "trainer@test.com", "600000003", RoleType.TRAINER);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         RoleType roleType) throws IncorrectLoginException {

        User user = new User(name, surname, email, phoneNumber, PASSWORD);

        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(roleType);
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);

        return userController.login(loginParams);
    }

    private ResultActions createExercise(AuthenticatedUserDto user, ExerciseDto exerciseDto) throws Exception {
        return mockMvc.perform(post("/api/exercises")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(exerciseDto))
                .requestAttr("userId", user.getUserDto().getId()));
    }

    @Test
    public void testCreateAndGetExerciseAsAdmin() throws Exception {
        ExerciseDto exerciseDto = new ExerciseDto(null, "Push-ups", "A basic push-up", "PENDING");

        String createdExerciseJson = createExercise(adminUser, exerciseDto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        mockMvc.perform(get("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Push-ups"));
    }

    @Test
    public void testUpdateExerciseAsAdmin() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Squat", "A basic squat", "PENDING");
        String createdExerciseJson = createExercise(adminUser, originalDto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        ExerciseDto updatedDto = new ExerciseDto(createdExercise.getId(), "Jump Squat", "An advanced squat", "PENDING");
        mockMvc.perform(put("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jump Squat"))
                .andExpect(jsonPath("$.description").value("An advanced squat"));
    }

    @Test
    public void testDeleteExerciseAsAdmin() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Lunge", "A basic lunge", "PENDING");
        String createdExerciseJson = createExercise(adminUser, originalDto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        mockMvc.perform(delete("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testFindAllExercisesAsAdmin() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateExerciseAsClientFails() throws Exception {
        ExerciseDto exerciseDto = new ExerciseDto(null, "Push-ups", "A basic push-up", "PENDING");
        createExercise(clientUser, exerciseDto).andExpect(status().isForbidden());
    }

    @Test
    public void testUpdateExerciseAsClientFails() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Plank", "Core exercise", "PENDING");
        String createdExerciseJson = createExercise(adminUser, originalDto).andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        ExerciseDto updatedDto = new ExerciseDto(createdExercise.getId(), "Side Plank", "Advanced core exercise", "PENDING");
        mockMvc.perform(put("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updatedDto)))
                .andExpect(status().isForbidden());    }

    @Test
    public void testDeleteExerciseAsClientFails() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Lunge", "A basic lunge", "PENDING");
        String createdExerciseJson = createExercise(adminUser, originalDto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);
        mockMvc.perform(delete("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test    public void testFindAllExercisesAsClient() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateExerciseAsTrainerFails() throws Exception {
        ExerciseDto exerciseDto = new ExerciseDto(null, "Crunches", "Abdominal exercise", "PENDING");
        createExercise(trainerUser, exerciseDto).andExpect(status().isForbidden());
    }

    @Test
    public void testDeleteExerciseAsTrainerFails() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Plank", "Core exercise", "PENDING");
        String createdExerciseJson = createExercise(adminUser, originalDto).andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        mockMvc.perform(delete("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testFindAllExercisesAsTrainer() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateExerciseUnauthenticatedFails() throws Exception {
        ExerciseDto exerciseDto = new ExerciseDto(null, "Burpees", "Full body exercise", "PENDING");
        mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(exerciseDto)))
                .andExpect(status().isForbidden());
    }
}