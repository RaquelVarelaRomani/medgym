package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.RoutineExerciseService;
import es.udc.fi.dc.fd.model.services.RoutineService;
import es.udc.fi.dc.fd.model.services.UserFollowService;
import es.udc.fi.dc.fd.rest.controllers.NotificationController;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
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
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class NotificationControllerTest {
    @Autowired
    private NotificationController notificationController;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private RoutineService routineService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserController userController;

    @Autowired
    private UserFollowService userFollowService;

    private AuthenticatedUserDto trainerUser;
    private AuthenticatedUserDto clientUser;

    private final static String PASSWORD = "password";

    @Before
    public void setUp() throws Exception {
        trainerUser = createAuthenticatedUser("Trainer", "One", "trainer1@test.com", "600000002", User.RoleType.TRAINER);
        clientUser = createAuthenticatedUser("Client", "User", "client@test.com", "600000004", User.RoleType.CLIENT);
    }

    private AuthenticatedUserDto createAuthenticatedUser(String name, String surname, String email, String phoneNumber,
                                                         User.RoleType roleType) throws Exception {
        User user = new User(name, surname, email, phoneNumber, PASSWORD, null, User.RoleType.CLIENT);

        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(roleType);
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    @Test
    public void testGetNotifications() throws Exception {
        User client = userDao.findById(clientUser.getUserDto().getId()).get();
        User trainer = userDao.findById(trainerUser.getUserDto().getId()).get();
        userFollowService.followTrainer(client.getId(), trainer.getId());
        routineService.createRoutine("test", "test", trainer, Routine.VisibilityType.PUBLIC);

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + clientUser.getServiceToken()))
                .andExpect(status().isOk());
    }
}
