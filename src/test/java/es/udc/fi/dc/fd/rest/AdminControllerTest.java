package es.udc.fi.dc.fd.rest;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminControllerTest {

    private final static String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserDao userDao;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto createAuthenticatedUser(String email, RoleType roleType)
            throws IncorrectLoginException {

        User user = new User("user", "1", email, "+34 000 000 000", "password", null, roleType);

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(roleType);

        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);

        return userController.login(loginParams);

    }

    @Test
    public void testGetAllUsers_Admin_Ok() throws Exception {

        AuthenticatedUserDto admin = createAuthenticatedUser("admin@email.com", RoleType.ADMIN);

        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + admin.getServiceToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

    }

    @Test
    public void testGetAllUsers_Client_Forbidden() throws Exception {

        AuthenticatedUserDto client = createAuthenticatedUser("client@email.com", RoleType.CLIENT);

        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + client.getServiceToken()))
                .andExpect(status().isForbidden());

    }

    @Test
    public void testGetAllUsers_Trainer_Forbidden() throws Exception {

        AuthenticatedUserDto trainer = createAuthenticatedUser("trainer@email.com", RoleType.TRAINER);

        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + trainer.getServiceToken()))
                .andExpect(status().isForbidden());

    }

    @Test
    public void testGetAllUsers_Unauthenticated_Forbidden() throws Exception {

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());

    }

}
