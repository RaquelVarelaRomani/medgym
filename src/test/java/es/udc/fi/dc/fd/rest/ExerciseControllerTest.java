package es.udc.fi.dc.fd.rest;

import static org.junit.jupiter.api.Assertions.*;
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
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;

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
    public void setUp() throws IncorrectLoginException, BlockedUserException {
        adminUser = createAuthenticatedUser("Admin", "User", "admin@test.com", "600000001", RoleType.ADMIN);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000002", RoleType.CLIENT);
        trainerUser = createAuthenticatedUser("Trainer", "User", "trainer@test.com", "600000003", RoleType.TRAINER);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         RoleType roleType) throws IncorrectLoginException, BlockedUserException {

        User user = new User(name, surname, email, phoneNumber, PASSWORD, null, null, User.StatusType.ACTIVE);

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
        ExerciseDto exerciseDto = new ExerciseDto(null, "Push-ups", "A basic push-up", MuscleGroup.CHEST.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());

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
        ExerciseDto originalDto = new ExerciseDto(null, "Squat", "A basic squat", MuscleGroup.LEG.name(), Equipment.DUMBBELL.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        String createdExerciseJson = createExercise(adminUser, originalDto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        ExerciseDto updatedDto = new ExerciseDto(createdExercise.getId(), "Jump Squat", "An advanced squat", MuscleGroup.LEG.name(), Equipment.BARBELL.name(), new byte[]{4,5,6}, "PENDING", adminUser.getUserDto().getId());
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
        ExerciseDto originalDto = new ExerciseDto(null, "Lunge", "A basic lunge", MuscleGroup.LEG.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
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
        ExerciseDto exerciseDto = new ExerciseDto(null, "Push-ups", "A basic push-up", MuscleGroup.CHEST.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        createExercise(clientUser, exerciseDto).andExpect(status().isForbidden());
    }

    @Test
    public void testUpdateExerciseAsClientFails() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Plank", "Core exercise", MuscleGroup.CORE.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        String createdExerciseJson = createExercise(adminUser, originalDto).andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        ExerciseDto updatedDto = new ExerciseDto(createdExercise.getId(), "Side Plank", "Advanced core exercise", MuscleGroup.CORE.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        mockMvc.perform(put("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updatedDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUpdateExerciseStatusAsClientFails() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Plank", "Core exercise", MuscleGroup.CORE.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        String createdExerciseJson = createExercise(adminUser, originalDto)
                .andReturn()
                .getResponse()
                .getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        String updateStatusJson = "{ \"status\": \"APPROVED\" }";

        mockMvc.perform(put("/api/exercises/" + createdExercise.getId() + "/status")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateStatusJson))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUpdateExerciseStatusAsTrainer() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Plank", "Core exercise", MuscleGroup.CORE.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", trainerUser.getUserDto().getId());
        String createdExerciseJson = createExercise(trainerUser, originalDto)
                .andReturn()
                .getResponse()
                .getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        String updateStatusJson = "{ \"status\": \"APPROVED\" }";

        mockMvc.perform(put("/api/exercises/" + createdExercise.getId() + "/status")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateStatusJson))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUpdateExerciseStatusAsAdmin() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Plank", "Core exercise", MuscleGroup.CORE.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        String createdExerciseJson = createExercise(adminUser, originalDto)
                .andReturn()
                .getResponse()
                .getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        String updateStatusJson = "{ \"status\": \"APPROVED\" }";

        mockMvc.perform(put("/api/exercises/" + createdExercise.getId() + "/status")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateStatusJson))
                .andExpect(status().isOk());
    }

    @Test
    public void testDeleteExerciseAsClientFails() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Lunge", "A basic lunge", MuscleGroup.LEG.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        String createdExerciseJson = createExercise(adminUser, originalDto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);
        mockMvc.perform(delete("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testFindAllExercisesAsClient() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateExerciseAsTrainerSucceeds() throws Exception {
        ExerciseDto exerciseDto = new ExerciseDto(null, "Crunches", "Abdominal exercise", MuscleGroup.CORE.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", trainerUser.getUserDto().getId());
        createExercise(trainerUser, exerciseDto).andExpect(status().isCreated());
    }

    @Test
    public void testDeleteExerciseAsTrainerSucceeds() throws Exception {
        ExerciseDto originalDto = new ExerciseDto(null, "Plank", "Core exercise", MuscleGroup.CORE.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", trainerUser.getUserDto().getId());
        String createdExerciseJson = createExercise(adminUser, originalDto).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        ExerciseDto createdExercise = objectMapper.readValue(createdExerciseJson, ExerciseDto.class);

        mockMvc.perform(delete("/api/exercises/" + createdExercise.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testFindAllExercisesAsTrainer() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testFindExercisesWithPendingStatusAsAdmin() throws Exception {
        mockMvc.perform(get("/api/exercises/pending")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testFindExercisesWithPendingStatusAsClientFails() throws Exception {
        mockMvc.perform(get("/api/exercises/pending")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testFindExercisesWithPendingStatusAsTrainerFails() throws Exception {
        mockMvc.perform(get("/api/exercises/pending")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testCreateExerciseUnauthenticatedFails() throws Exception {
        ExerciseDto exerciseDto = new ExerciseDto(null, "Burpees", "Full body exercise", MuscleGroup.FULL_BODY.name(), Equipment.NONE.name(), new byte[]{1,2,3}, "PENDING", adminUser.getUserDto().getId());
        mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(exerciseDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetMuscleGroups() throws Exception {
        mockMvc.perform(get("/api/exercises/muscleGroups")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(MuscleGroup.values().length))
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void testGetEquipments() throws Exception {
        mockMvc.perform(get("/api/exercises/equipments")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(Equipment.values().length))
                .andExpect(jsonPath("$[0].name").exists());
    }

}
