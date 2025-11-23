package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.UserBlockService;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class UserControllerTest {

	private static final String PASSWORD = "password";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private UserDao userDao;

	@Autowired
	private UserBlockService userBlockService;

	@Autowired
	private UserController userController;

	private AuthenticatedUserDto createAuthenticatedUser(String email, RoleType roleType)
			throws IncorrectLoginException, BlockedUserException {

		User user = new User("user", "1", email, "+34 000 000 000", "password", RoleType.CLIENT, User.StatusType.ACTIVE);

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(roleType);

		userDao.save(user);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setEmail(user.getEmail());
		loginParams.setPassword(PASSWORD);

		return userController.login(loginParams);

	}

	@Test
	void testPostLogin_Ok() throws Exception {

		AuthenticatedUserDto user = createAuthenticatedUser("user@email.com", RoleType.CLIENT);

		LoginParamsDto loginParams = new LoginParamsDto();
		loginParams.setEmail(user.getUserDto().getEmail());
		loginParams.setPassword(PASSWORD);

		ObjectMapper mapper = new ObjectMapper();

		mockMvc.perform(post("/api/users/login").header("Authorization", "Bearer " + user.getServiceToken())
				.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(loginParams)))
				.andExpect(status().isOk());

	}

    @Test
    void testChangePassword_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("pass@test.com", RoleType.CLIENT);

        String json = """
    {
      "oldPassword": "password",
      "newPassword": "newpass"
    }
    """;

        mockMvc.perform(post("/api/users/" + user.getUserDto().getId() + "/changePassword")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNoContent());
    }

    @Test
    void testChangePassword_PermissionDenied() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("user1@test.com", RoleType.CLIENT);

        String json = """
    {
      "oldPassword": "password",
      "newPassword": "newpass"
    }
    """;

        mockMvc.perform(post("/api/users/" + (user.getUserDto().getId() + 1) + "/changePassword")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    void testChangePassword_IncorrectOldPassword() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("user2@test.com", RoleType.CLIENT);

        String json = """
    {
      "oldPassword": "wrong",
      "newPassword": "newpass"
    }
    """;

        mockMvc.perform(post("/api/users/" + user.getUserDto().getId() + "/changePassword")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound()); // manejado por @ExceptionHandler
    }

    @Test
    void testSetTrainerPremium_Ok() throws Exception {
        AuthenticatedUserDto trainer = createAuthenticatedUser("trainer@test.com", RoleType.TRAINER);

        mockMvc.perform(put("/api/users/" + trainer.getUserDto().getId() + "/premium")
                        .header("Authorization", "Bearer " + trainer.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testSetTrainerPremium_PermissionDenied() throws Exception {
        AuthenticatedUserDto trainer = createAuthenticatedUser("trainer2@test.com", RoleType.TRAINER);

        mockMvc.perform(put("/api/users/" + (trainer.getUserDto().getId() + 1) + "/premium")
                        .header("Authorization", "Bearer " + trainer.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testSignUp_Ok() throws Exception {
        String json = """
        {
          "name": "John",
          "surname": "Doe",
          "email": "john@test.com",
          "phoneNumber": "+34 123 456 789",
          "password": "password"
        }
        """;

        mockMvc.perform(post("/api/users/signUp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"));
    }

    @Test
    void testSignUp_DuplicateEmail() throws Exception {
        // First sign up
        User user = new User("existing", "user", "dup@test.com", "+34 000 000 001", "password", RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.save(user);

        String json = """
        {
          "name": "Jane",
          "surname": "Doe",
          "email": "dup@test.com",
          "phoneNumber": "+34 987 654 321",
          "password": "password"
        }
        """;

        mockMvc.perform(post("/api/users/signUp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLogin_IncorrectPassword() throws Exception {
        User user = new User("test", "user", "login@test.com", "+34 000 000 002", "password", RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.save(user);

        String json = """
        {
          "email": "login@test.com",
          "password": "wrong"
        }
        """;

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound());
    }

    @Test
    void testLogin_BlockedUser() throws Exception {
        User user = new User("blocked", "user", "blocked@test.com", "+34 000 000 003", "password", RoleType.CLIENT, User.StatusType.BLOCKED);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.save(user);

        String json = """
        {
          "email": "blocked@test.com",
          "password": "password"
        }
        """;

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    void testLoginFromServiceToken_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("token@test.com", RoleType.CLIENT);

        mockMvc.perform(post("/api/users/loginFromServiceToken")
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateProfile_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("update@test.com", RoleType.CLIENT);

        String json = """
        {
          "name": "Updated",
          "surname": "Name",
          "email": "updated@test.com",
          "phoneNumber": "+34 111 222 333"
        }
        """;

        mockMvc.perform(put("/api/users/" + user.getUserDto().getId())
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateProfile_PermissionDenied() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("update1@test.com", RoleType.CLIENT);
        AuthenticatedUserDto other = createAuthenticatedUser("update2@test.com", RoleType.CLIENT);

        String json = """
        {
          "name": "Hacked",
          "surname": "Name",
          "email": "hacked@test.com",
          "phoneNumber": "+34 444 555 666"
        }
        """;

        mockMvc.perform(put("/api/users/" + other.getUserDto().getId())
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetUser_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("get@test.com", RoleType.CLIENT);

        mockMvc.perform(get("/api/users/" + user.getUserDto().getId())
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testGetUser_Blocked() throws Exception {
        AuthenticatedUserDto blocker = createAuthenticatedUser("blocker@test.com", RoleType.CLIENT);
        AuthenticatedUserDto blocked = createAuthenticatedUser("blocked2@test.com", RoleType.CLIENT);

        userBlockService.blockUser(blocker.getUserDto().getId(), blocked.getUserDto().getId());

        mockMvc.perform(get("/api/users/" + blocked.getUserDto().getId())
                        .header("Authorization", "Bearer " + blocker.getServiceToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetAllUsers_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("all@test.com", RoleType.CLIENT);

        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchUsers_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("search@test.com", RoleType.CLIENT);

        mockMvc.perform(get("/api/users/search")
                        .param("q", "test")
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteUser_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("delete@test.com", RoleType.CLIENT);

        mockMvc.perform(delete("/api/users/" + user.getUserDto().getId())
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testUpdateBodyMetrics_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("body@test.com", RoleType.CLIENT);

        String json = """
        {
          "weightKg": 70.5,
          "heightCm": 175.0,
          "gender": "MALE"
        }
        """;

        mockMvc.perform(put("/api/users/" + user.getUserDto().getId() + "/bodyMetrics")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateBodyMetrics_InvalidGender() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("body2@test.com", RoleType.CLIENT);

        String json = """
        {
          "weightKg": 70.5,
          "heightCm": 175.0,
          "gender": "INVALID"
        }
        """;

        mockMvc.perform(put("/api/users/" + user.getUserDto().getId() + "/bodyMetrics")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testClearBodyMetrics_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("clear@test.com", RoleType.CLIENT);

        mockMvc.perform(delete("/api/users/" + user.getUserDto().getId() + "/bodyMetrics")
                        .header("Authorization", "Bearer " + user.getServiceToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testCalculateBmi_Ok() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("bmi@test.com", RoleType.CLIENT);

        String json = """
        {
          "weightKg": 70.0,
          "heightCm": 170.0
        }
        """;

        mockMvc.perform(post("/api/users/" + user.getUserDto().getId() + "/bmi/calculate")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());
    }

    @Test
    void testCalculateBmi_InvalidParams() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("bmi2@test.com", RoleType.CLIENT);

        String json = """
        {
          "weightKg": 70.0,
          "heightCm": 0
        }
        """;

        mockMvc.perform(post("/api/users/" + user.getUserDto().getId() + "/bmi/calculate")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }


}
