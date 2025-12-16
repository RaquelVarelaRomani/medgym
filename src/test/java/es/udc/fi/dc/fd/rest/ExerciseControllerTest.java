package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
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

import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;
import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ExerciseControllerTest {

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
    private UserController userController;

    private AuthenticatedUserDto adminUser;
    private AuthenticatedUserDto clientUser;
    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto trainerUserPremium;

    @BeforeEach
    void setUp() throws IncorrectLoginException, BlockedUserException {
        adminUser = createAuthenticatedUser("Admin", "User", "admin@test.com", "600000001", RoleType.ADMIN, null);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000002", RoleType.CLIENT, null);
        trainerUser = createAuthenticatedUser("Trainer", "User", "trainer@test.com", "600000003", RoleType.TRAINER, false);
        trainerUserPremium = createAuthenticatedUser("TrainerP", "User", "trainerP@test.com", "600000004", RoleType.TRAINER, true);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         RoleType roleType, Boolean premium)
            throws IncorrectLoginException, BlockedUserException {

        User user = new User(name, surname, email, phoneNumber, PASSWORD, null, User.StatusType.ACTIVE);

        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(roleType);
        user.setTrainerPremium(premium);
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

    // -----------------------------------------------------------------------
    // TESTS
    // -----------------------------------------------------------------------

    @Test
    void testCreateAndGetExerciseAsAdmin() throws Exception {
        ExerciseDto exerciseDto = new ExerciseDto();
        exerciseDto.setName("Push-ups");
        exerciseDto.setDescription("A basic push-up");
        exerciseDto.setMuscleGroup(MuscleGroup.CHEST.name());
        exerciseDto.setEquipment(Equipment.NONE.name());
        exerciseDto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        exerciseDto.setImage(new byte[]{1, 2, 3});
        exerciseDto.setStatus("PENDING");
        exerciseDto.setCreatorId(adminUser.getUserDto().getId());

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
    void testUpdateExerciseAsAdmin() throws Exception {

        // original DTO
        ExerciseDto originalDto = new ExerciseDto();
        originalDto.setName("Squat");
        originalDto.setDescription("A basic squat");
        originalDto.setMuscleGroup(MuscleGroup.LEG.name());
        originalDto.setEquipment(Equipment.DUMBBELL.name());
        originalDto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        originalDto.setImage(new byte[]{1, 2, 3});
        originalDto.setStatus("PENDING");
        originalDto.setCreatorId(adminUser.getUserDto().getId());

        String createdJson = createExercise(adminUser, originalDto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        // updated DTO
        ExerciseDto updatedDto = new ExerciseDto();
        updatedDto.setId(created.getId());
        updatedDto.setName("Jump Squat");
        updatedDto.setDescription("An advanced squat");
        updatedDto.setMuscleGroup(MuscleGroup.LEG.name());
        updatedDto.setEquipment(Equipment.BARBELL.name());
        updatedDto.setImage(new byte[]{4, 5, 6});
        updatedDto.setStatus("PENDING");
        updatedDto.setCreatorId(adminUser.getUserDto().getId());

        mockMvc.perform(put("/api/exercises/" + created.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jump Squat"))
                .andExpect(jsonPath("$.description").value("An advanced squat"));
    }

    @Test
    void testDeleteExerciseAsAdmin() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Lunge");
        dto.setDescription("A basic lunge");
        dto.setMuscleGroup(MuscleGroup.LEG.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(adminUser.getUserDto().getId());

        String createdJson = createExercise(adminUser, dto)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        mockMvc.perform(delete("/api/exercises/" + created.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/exercises/" + created.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testFindAllExercisesAsAdmin() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateExerciseAsClientFails() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Push-ups");
        dto.setDescription("A basic push-up");
        dto.setMuscleGroup(MuscleGroup.CHEST.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(adminUser.getUserDto().getId());

        createExercise(clientUser, dto).andExpect(status().isForbidden());
    }

    @Test
    void testUpdateExerciseAsClientFails() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Plank");
        dto.setDescription("Core exercise");
        dto.setMuscleGroup(MuscleGroup.CORE.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(adminUser.getUserDto().getId());

        String createdJson = createExercise(adminUser, dto)
                .andReturn().getResponse().getContentAsString();

        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        ExerciseDto updated = new ExerciseDto();
        updated.setId(created.getId());
        updated.setName("Side Plank");
        updated.setDescription("Advanced core exercise");
        updated.setMuscleGroup(MuscleGroup.CORE.name());
        updated.setEquipment(Equipment.NONE.name());
        updated.setImage(new byte[]{1, 2, 3});
        updated.setStatus("PENDING");
        updated.setCreatorId(adminUser.getUserDto().getId());

        mockMvc.perform(put("/api/exercises/" + created.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updated)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateExerciseStatusAsClientFails() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Plank");
        dto.setDescription("Core exercise");
        dto.setMuscleGroup(MuscleGroup.CORE.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(adminUser.getUserDto().getId());

        String createdJson = createExercise(adminUser, dto)
                .andReturn().getResponse().getContentAsString();

        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        String updateStatusJson = "{ \"status\": \"APPROVED\" }";

        mockMvc.perform(put("/api/exercises/" + created.getId() + "/status")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateStatusJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateExerciseStatusAsTrainer() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Plank");
        dto.setDescription("Core exercise");
        dto.setMuscleGroup(MuscleGroup.CORE.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(trainerUser.getUserDto().getId());

        String createdJson = createExercise(trainerUser, dto)
                .andReturn()
                .getResponse()
                .getContentAsString();

        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        String updateStatusJson = "{ \"status\": \"APPROVED\" }";

        mockMvc.perform(put("/api/exercises/" + created.getId() + "/status")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateStatusJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateExerciseStatusAsAdmin() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Plank");
        dto.setDescription("Core exercise");
        dto.setMuscleGroup(MuscleGroup.CORE.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(adminUser.getUserDto().getId());

        String createdJson = createExercise(adminUser, dto)
                .andReturn()
                .getResponse()
                .getContentAsString();
        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        String updateStatusJson = "{ \"status\": \"APPROVED\" }";

        mockMvc.perform(put("/api/exercises/" + created.getId() + "/status")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateStatusJson))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteExerciseAsClientFails() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Lunge");
        dto.setDescription("A basic lunge");
        dto.setMuscleGroup(MuscleGroup.LEG.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(adminUser.getUserDto().getId());

        String createdJson = createExercise(adminUser, dto)
                .andReturn().getResponse().getContentAsString();

        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        mockMvc.perform(delete("/api/exercises/" + created.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testFindAllExercisesAsClient() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateExerciseAsTrainerSucceeds() throws Exception {
        ExerciseDto dto = new ExerciseDto();
        dto.setName("Crunches");
        dto.setDescription("Abdominal exercise");
        dto.setMuscleGroup(MuscleGroup.CORE.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(trainerUserPremium.getUserDto().getId());

        createExercise(trainerUserPremium, dto).andExpect(status().isCreated());
    }

    @Test
    void testDeleteExerciseAsTrainerSucceeds() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Plank");
        dto.setDescription("Core exercise");
        dto.setMuscleGroup(MuscleGroup.CORE.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setExerciseType(Exercise.ExerciseType.STRENGTH.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(trainerUser.getUserDto().getId());

        String createdJson = createExercise(adminUser, dto)
                .andReturn().getResponse().getContentAsString();

        ExerciseDto created = objectMapper.readValue(createdJson, ExerciseDto.class);

        mockMvc.perform(delete("/api/exercises/" + created.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testFindAllExercisesAsTrainer() throws Exception {
        mockMvc.perform(get("/api/exercises")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testFindExercisesWithPendingStatusAsAdmin() throws Exception {
        mockMvc.perform(get("/api/exercises/pending")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testFindExercisesWithPendingStatusAsClientFails() throws Exception {
        mockMvc.perform(get("/api/exercises/pending")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testFindExercisesWithPendingStatusAsTrainerFails() throws Exception {
        mockMvc.perform(get("/api/exercises/pending")
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreateExerciseUnauthenticatedFails() throws Exception {

        ExerciseDto dto = new ExerciseDto();
        dto.setName("Burpees");
        dto.setDescription("Full body exercise");
        dto.setMuscleGroup(MuscleGroup.FULL_BODY.name());
        dto.setEquipment(Equipment.NONE.name());
        dto.setImage(new byte[]{1, 2, 3});
        dto.setStatus("PENDING");
        dto.setCreatorId(adminUser.getUserDto().getId());

        mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetMuscleGroups() throws Exception {
        mockMvc.perform(get("/api/exercises/muscleGroups")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(MuscleGroup.values().length))
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    void testGetEquipments() throws Exception {
        mockMvc.perform(get("/api/exercises/equipments")
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(Equipment.values().length))
                .andExpect(jsonPath("$[0].name").exists());
    }

}
