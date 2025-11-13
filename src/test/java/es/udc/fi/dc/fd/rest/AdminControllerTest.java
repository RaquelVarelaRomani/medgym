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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
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
            throws IncorrectLoginException, BlockedUserException {

        User user = new User("user", "1", email, "+34 000 000 000", "password", null, roleType, User.StatusType.ACTIVE);

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

    @Test
    public void testBlockUser_Admin_Ok() throws Exception {

        AuthenticatedUserDto admin = createAuthenticatedUser("admin2@email.com", RoleType.ADMIN);
        User userToBlock = new User("user", "2", "user2@email.com", "+34 000 000 001", "password", null, RoleType.CLIENT, User.StatusType.ACTIVE);
        userToBlock.setPassword(passwordEncoder.encode(userToBlock.getPassword()));
        userDao.save(userToBlock);

        mockMvc.perform(put("/api/admin/users/" + userToBlock.getId() + "/block")
                .header("Authorization", "Bearer " + admin.getServiceToken()))
                .andExpect(status().isOk());

    }

    @Test
    public void testBlockUser_Client_Forbidden() throws Exception {

        AuthenticatedUserDto client = createAuthenticatedUser("client2@email.com", RoleType.CLIENT);
        User userToBlock = new User("user", "3", "user3@email.com", "+34 000 000 002", "password", null, RoleType.CLIENT, User.StatusType.ACTIVE);
        userToBlock.setPassword(passwordEncoder.encode(userToBlock.getPassword()));
        userDao.save(userToBlock);

        mockMvc.perform(put("/api/admin/users/" + userToBlock.getId() + "/block")
                .header("Authorization", "Bearer " + client.getServiceToken()))
                .andExpect(status().isForbidden());

    }

    @Test
    public void testUnblockUser_Admin_Ok() throws Exception {

        AuthenticatedUserDto admin = createAuthenticatedUser("admin3@email.com", RoleType.ADMIN);
        User userToUnblock = new User("user", "4", "user4@email.com", "+34 000 000 003", "password", null, RoleType.CLIENT, User.StatusType.ACTIVE);
        userToUnblock.setPassword(passwordEncoder.encode(userToUnblock.getPassword()));
        userToUnblock.setStatus(User.StatusType.BLOCKED);
        userDao.save(userToUnblock);

        mockMvc.perform(put("/api/admin/users/" + userToUnblock.getId() + "/unblock")
                .header("Authorization", "Bearer " + admin.getServiceToken()))
                .andExpect(status().isOk());

    }

    @Test
    public void testUnblockUser_Client_Forbidden() throws Exception {

        AuthenticatedUserDto client = createAuthenticatedUser("client3@email.com", RoleType.CLIENT);
        User userToUnblock = new User("user", "5", "user5@email.com", "+34 000 000 004", "password", null, RoleType.CLIENT, User.StatusType.ACTIVE);
        userToUnblock.setPassword(passwordEncoder.encode(userToUnblock.getPassword()));
        userToUnblock.setStatus(User.StatusType.BLOCKED);
        userDao.save(userToUnblock);

        mockMvc.perform(put("/api/admin/users/" + userToUnblock.getId() + "/unblock")
                .header("Authorization", "Bearer " + client.getServiceToken()))
                .andExpect(status().isForbidden());

    }

    @Test
    public void testBlockUser_NonExistentUser_NotFound() throws Exception {

        AuthenticatedUserDto admin = createAuthenticatedUser("admin404@email.com", RoleType.ADMIN);

        mockMvc.perform(put("/api/admin/users/999999/block")
                        .header("Authorization", "Bearer " + admin.getServiceToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testUnblockUser_NonExistentUser_NotFound() throws Exception {

        AuthenticatedUserDto admin = createAuthenticatedUser("admin405@email.com", RoleType.ADMIN);

        mockMvc.perform(put("/api/admin/users/999999/unblock")
                        .header("Authorization", "Bearer " + admin.getServiceToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testBlockUser_Self_Forbidden() throws Exception {

        AuthenticatedUserDto admin = createAuthenticatedUser("adminSelf@email.com", RoleType.ADMIN);

        mockMvc.perform(put("/api/admin/users/" + admin.getUserDto().getId() + "/block")
                        .header("Authorization", "Bearer " + admin.getServiceToken()))
                .andExpect(status().isForbidden());
    }

}
