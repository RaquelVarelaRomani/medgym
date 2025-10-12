package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.RoutineSuscriptionController;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.RoutineDto;
import org.junit.Before;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RoutineSuscriptionControllerTest {

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
    private RoutineSuscriptionDao routineSuscriptionDao;

    @Autowired
    private RoutineDao routineDao;

    private AuthenticatedUserDto trainerUser;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto createTrainerAndSetUp() throws Exception {
        User trainer = userDao.save(new User("trainer", "trainer", "trainer@email.com",
                "666777222", passwordEncoder.encode(PASSWORD), null, User.RoleType.TRAINER));
        Routine routine = routineDao.save(new Routine("test", "test", Routine.VisibilityType.PUBLIC,
                trainer));
        User client = userDao.save(new User("client", "client", "client@email.com",
                "666333555", "password", null, User.RoleType.CLIENT));

        routineSuscriptionDao.save(new RoutineSuscription(client, routine));

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(trainer.getEmail());
        loginParams.setPassword(PASSWORD);
        return userController.login(loginParams);
    }

    @Test
    public void testGetRoutineSuscription() throws Exception {
        AuthenticatedUserDto user = createTrainerAndSetUp();

        mockMvc.perform(get("/api/trainer/routines/followers")
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetRoutineSuscriptionByClient() throws Exception {
        createTrainerAndSetUp();
        User client = userDao.save(new User("client2", "client2", "client2@email.com",
                "666333556", passwordEncoder.encode(PASSWORD), null, User.RoleType.CLIENT));

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(client.getEmail());
        loginParams.setPassword(PASSWORD);
        AuthenticatedUserDto user = userController.login(loginParams);

        mockMvc.perform(get("/api/trainer/routines/followers")
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isForbidden());
    }
}
