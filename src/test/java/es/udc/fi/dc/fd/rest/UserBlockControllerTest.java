package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.UserBlockService;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserBlockControllerTest {

    private static final String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserController userController;

    @Autowired
    private UserBlockService userBlockService;

    /** Crea usuario real, lo guarda y devuelve su token */
    private AuthenticatedUserDto createAuthenticatedUser(String email)
            throws Exception {

        User user = new User("Test", "User", email, "+34 000 000 000",
                PASSWORD, RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        userDao.save(user);

        LoginParamsDto params = new LoginParamsDto();
        params.setEmail(email);
        params.setPassword(PASSWORD);

        return userController.login(params);
    }

    // -------------------------------------------------------------
    // TEST: Bloquear usuario
    // -------------------------------------------------------------

    @Test
    void testBlockUser_Ok() throws Exception {
        AuthenticatedUserDto blocker = createAuthenticatedUser("blocker@test.com");
        AuthenticatedUserDto blocked = createAuthenticatedUser("blocked@test.com");

        mockMvc.perform(post("/api/blocks/" + blocked.getUserDto().getId())
                        .header("Authorization", "Bearer " + blocker.getServiceToken())
                        .requestAttr("userId", blocker.getUserDto().getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testBlockUser_SelfBlock_Forbidden() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("self@test.com");

        mockMvc.perform(post("/api/blocks/" + user.getUserDto().getId())
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .requestAttr("userId", user.getUserDto().getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testBlockUser_NotFound() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("user1@test.com");

        mockMvc.perform(post("/api/blocks/9999")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .requestAttr("userId", user.getUserDto().getId()))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------
    // TEST: Desbloquear usuario
    // -------------------------------------------------------------

    @Test
    void testUnblockUser_Ok() throws Exception {
        AuthenticatedUserDto blocker = createAuthenticatedUser("blocker2@test.com");
        AuthenticatedUserDto blocked = createAuthenticatedUser("blocked2@test.com");

        // Primero bloquear
        userBlockService.blockUser(blocker.getUserDto().getId(), blocked.getUserDto().getId());

        mockMvc.perform(delete("/api/blocks/" + blocked.getUserDto().getId())
                        .header("Authorization", "Bearer " + blocker.getServiceToken())
                        .requestAttr("userId", blocker.getUserDto().getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testUnblockUser_NotFound() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("unblock@test.com");

        mockMvc.perform(delete("/api/blocks/9999")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .requestAttr("userId", user.getUserDto().getId()))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------
    // TEST: Comprobar bloqueo bidireccional
    // -------------------------------------------------------------

    @Test
    void testIsBlocked_True() throws Exception {
        AuthenticatedUserDto a = createAuthenticatedUser("a@test.com");
        AuthenticatedUserDto b = createAuthenticatedUser("b@test.com");

        userBlockService.blockUser(a.getUserDto().getId(), b.getUserDto().getId());

        mockMvc.perform(get("/api/blocks/has-blocked/" + b.getUserDto().getId())
                        .header("Authorization", "Bearer " + a.getServiceToken())
                        .requestAttr("userId", a.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String content = result.getResponse().getContentAsString();
                    assert(content.equals("true"));
                });
    }

    @Test
    void testIsBlocked_False() throws Exception {
        AuthenticatedUserDto a = createAuthenticatedUser("a2@test.com");
        AuthenticatedUserDto b = createAuthenticatedUser("b2@test.com");

        mockMvc.perform(get("/api/blocks/has-blocked/" + b.getUserDto().getId())
                        .header("Authorization", "Bearer " + a.getServiceToken())
                        .requestAttr("userId", a.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String content = result.getResponse().getContentAsString();
                    assert(content.equals("false"));
                });
    }
}
