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
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RoutineControllerTest {

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
    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto anotherTrainerUser;
    private AuthenticatedUserDto clientUser;

    @Before
    public void setUp() throws IncorrectLoginException {
        adminUser = createAuthenticatedUser("Admin", "User", "admin@test.com", "600000001", RoleType.ADMIN);
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002", RoleType.TRAINER);
        anotherTrainerUser = createAuthenticatedUser("Trainer", "Two", "trainer2@test.com", "600000003",
                RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000004", RoleType.CLIENT);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         RoleType roleType) throws IncorrectLoginException {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, null);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(roleType);
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    private ResultActions createRoutine(AuthenticatedUserDto user, String name) throws Exception {
        RoutineDto routineDto = new RoutineDto();
        routineDto.setName(name);
        routineDto.setDescription("Description for " + name);
        return mockMvc.perform(post("/api/routines")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(routineDto))
                .requestAttr("userId", user.getUserDto().getId()));
    }

    private RoutineDto getRoutineFromResponse(ResultActions actions) throws Exception {
        String content = actions.andReturn().getResponse().getContentAsString();
        return objectMapper.readValue(content, RoutineDto.class);
    }

    @Test
    public void testCreateRoutineAsAdmin() throws Exception {
        createRoutine(adminUser, "Admin Routine").andExpect(status().isCreated());
    }

    @Test
    public void testUpdateAnotherUsersRoutineAsAdmin() throws Exception {
        ResultActions createActions = createRoutine(trainerUser, "Trainer's Routine").andExpect(status().isCreated());
        RoutineDto routineToUpdate = getRoutineFromResponse(createActions);

        routineToUpdate.setName("Updated by Admin");
        mockMvc.perform(put("/api/routines/" + routineToUpdate.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineToUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated by Admin"));
    }

    @Test
    public void testDeleteAnotherUsersRoutineAsAdmin() throws Exception {
        ResultActions createActions = createRoutine(trainerUser, "Routine to Delete").andExpect(status().isCreated());
        RoutineDto routineToDelete = getRoutineFromResponse(createActions);

        mockMvc.perform(delete("/api/routines/" + routineToDelete.getId())
                        .header("Authorization", "Bearer " + adminUser.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testCreateAndUpdateOwnRoutineAsTrainer() throws Exception {
        ResultActions createActions = createRoutine(trainerUser, "My Trainer Routine").andExpect(status().isCreated());
        RoutineDto createdRoutine = getRoutineFromResponse(createActions);

        createdRoutine.setDescription("Updated description");
        mockMvc.perform(put("/api/routines/" + createdRoutine.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createdRoutine)))
                .andExpect(status().isOk());
    }

    @Test
    public void testDeleteOwnRoutineAsTrainer() throws Exception {
        ResultActions createActions = createRoutine(trainerUser, "My Deletable Routine").andExpect(status().isCreated());
        RoutineDto createdRoutine = getRoutineFromResponse(createActions);

        mockMvc.perform(delete("/api/routines/" + createdRoutine.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testUpdateAnotherTrainersRoutineFails() throws Exception {
        ResultActions createActions = createRoutine(anotherTrainerUser, "Another Trainer's Routine")
                .andExpect(status().isCreated());
        RoutineDto routineToUpdate = getRoutineFromResponse(createActions);

        routineToUpdate.setName("Illegal Update");
        mockMvc.perform(put("/api/routines/" + routineToUpdate.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineToUpdate)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testDeleteAnotherTrainersRoutineFails() throws Exception {
        ResultActions createActions = createRoutine(anotherTrainerUser, "Another's Deletable")
                .andExpect(status().isCreated());
        RoutineDto routineToDelete = getRoutineFromResponse(createActions);

        mockMvc.perform(delete("/api/routines/" + routineToDelete.getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testFindAllRoutinesAsClient() throws Exception {
        mockMvc.perform(get("/api/routines")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateRoutineAsClientFails() throws Exception {
        createRoutine(clientUser, "Client Routine").andExpect(status().isForbidden());
    }

    @Test
    public void testUpdateRoutineAsClientFails() throws Exception {
        ResultActions createActions = createRoutine(trainerUser, "Existing Routine").andExpect(status().isCreated());
        RoutineDto routine = getRoutineFromResponse(createActions);

        mockMvc.perform(put("/api/routines/" + routine.getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routine)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testCreateRoutineUnauthenticatedFails() throws Exception {
        RoutineDto routineDto = new RoutineDto();
        routineDto.setName("Test");
        routineDto.setDescription("Test Description");
        mockMvc.perform(post("/api/routines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(routineDto)))
                .andExpect(status().isForbidden());
    }
}