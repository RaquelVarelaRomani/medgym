package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.controllers.UserFollowController;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserFollowControllerTest {
    private static final String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserDao userDao;

    @Autowired
    private UserController userController;

    @Autowired
    private UserFollowController userFollowController;

    private AuthenticatedUserDto clientUser;
    private AuthenticatedUserDto trainerUser;

    @Before
    void setUp() throws IncorrectLoginException, BlockedUserException {
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000002", User.RoleType.CLIENT);
        trainerUser = createAuthenticatedUser("Trainer", "User", "trainer@test.com", "600000003", User.RoleType.TRAINER);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         User.RoleType roleType) throws IncorrectLoginException, BlockedUserException {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, null, User.StatusType.ACTIVE);

        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(roleType);
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);

        return userController.login(loginParams);
    }

    @Test
    void testFollowAndUnfollowTrainer() throws Exception {
        mockMvc.perform(post("/api/users/follow/" + trainerUser.getUserDto().getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/users/follow/" + trainerUser.getUserDto().getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isNoContent());
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/users/follow/followers/" + trainerUser.getUserDto().getId())
                        .header("Authorization", "Bearer " + trainerUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testGetFollowedTrainers() throws Exception {
        // client sigue a trainer
        mockMvc.perform(post("/api/users/follow/" + trainerUser.getUserDto().getId())
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/users/follow/client/" + clientUser.getUserDto().getId() + "/following")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testFollowTrainer_NotFound() throws Exception {
        mockMvc.perform(post("/api/users/follow/" + 999999)
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isNotFound());
    }
}
