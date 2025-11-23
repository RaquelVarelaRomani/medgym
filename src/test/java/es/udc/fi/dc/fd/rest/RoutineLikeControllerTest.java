package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.RoutineLikeService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RoutineLikeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserController userController;

    @Autowired
    private RoutineLikeService routineLikeService;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;

    private static final String PASSWORD = "password";

    @Before
    public void setUp() throws Exception {
        trainerUser = createAuthenticatedUser("Trainer", "Test", "trainer_like@test.com", "600000100", User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "Like", "client_like@test.com", "600000101", User.RoleType.CLIENT);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         User.RoleType roleType) throws Exception {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, roleType, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    @Test
    public void testLikeRoutine() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = routineService.createRoutine(
                "Rutina para likes", "Descripción", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        mockMvc.perform(post("/api/routines/" + routine.getId() + "/like")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId()))
                .andExpect(status().isOk());

        List<?> likes = routineLikeService.getRoutineLikesByUser(clientUser.getUserDto().getId());
        org.junit.Assert.assertEquals(1, likes.size());
    }

    @Test
    public void testGetRoutineLikesByUser() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = routineService.createRoutine(
                "Rutina consultar likes", "Descripción", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineLikeService.likeRoutine(clientUser.getUserDto().getId(), routine.getId());

        mockMvc.perform(get("/api/routineLikes")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].routineId").value(routine.getId()));
    }

    @Test
    public void testUnlikeRoutine() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = routineService.createRoutine(
                "Rutina unlike", "Descripción", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        routineLikeService.likeRoutine(clientUser.getUserDto().getId(), routine.getId());

        mockMvc.perform(delete("/api/routines/" + routine.getId() + "/unlike")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId()))
                .andExpect(status().isOk());

        List<?> likes = routineLikeService.getRoutineLikesByUser(clientUser.getUserDto().getId());
        org.junit.Assert.assertTrue(likes.isEmpty());
    }

    @Test
    public void testLikeRoutine_Unauthenticated() throws Exception {
        mockMvc.perform(post("/api/routines/1/like"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testLikeRoutine_RoutineNotFound() throws Exception {
        mockMvc.perform(post("/api/routines/-1/like")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testUnlikeRoutine_WhenNotLiked_NoError() throws Exception {
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        Routine routine = routineService.createRoutine("R", "D", trainer,
                Routine.VisibilityType.PUBLIC, Routine.DifficultyType.BEGINNER);

        mockMvc.perform(delete("/api/routines/" + routine.getId() + "/unlike")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken())
                        .requestAttr("userId", clientUser.getUserDto().getId()))
                .andExpect(status().isOk());
    }
}
