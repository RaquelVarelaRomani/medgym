package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.ExerciseDao;
import es.udc.fi.dc.fd.model.entities.ExerciseMaxWeight;
import es.udc.fi.dc.fd.model.entities.ExerciseMaxWeightDao;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.ExerciseMaxWeightService;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ExerciseMaxWeightControllerTest {

    private static final String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ExerciseMaxWeightDao exerciseMaxWeightDao;

    @Autowired
    private ExerciseDao exerciseDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ExerciseMaxWeightService exerciseMaxWeightService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserController userController;

    private AuthenticatedUserDto createAuthenticatedUser(String email, User.RoleType roleType)
            throws IncorrectLoginException, BlockedUserException {

        User user = new User("user", "1", email, "+34 000 000 000", "password", roleType, User.StatusType.ACTIVE);

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(roleType);

        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(user.getEmail());
        loginParams.setPassword(PASSWORD);

        return userController.login(loginParams);

    }

    private Exercise createExercise(String name) {
        Exercise e = new Exercise(name, "desc",
                Exercise.ExerciseStatus.APPROVED);
        return exerciseDao.save(e);
    }

    @Test
    void testAddOrUpdateMaxWeight_CreateNew() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("u1@test.com", User.RoleType.CLIENT);
        Exercise ex = createExercise("ex1");

        mockMvc.perform(post("/api/exercises/" + ex.getId() + "/maxWeight")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .requestAttr("userId", user.getUserDto().getId())
                        .param("maxWeightKg", "75"))
                .andExpect(status().isOk());

        ExerciseMaxWeight stored =
                exerciseMaxWeightDao.findByUserIdAndExerciseId(user.getUserDto().getId(), ex.getId());

        assert(stored != null);
        assert(stored.getMaxWeightKg() == 75.0);
    }

    @Test
    void testAddOrUpdateMaxWeight_UpdateExisting() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("u2@test.com", User.RoleType.CLIENT);
        Exercise ex = createExercise("ex2");

        exerciseMaxWeightService.addOrUpdateMaxWeight(user.getUserDto().getId(), ex.getId(), (short) 50);

        mockMvc.perform(post("/api/exercises/" + ex.getId() + "/maxWeight")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .requestAttr("userId", user.getUserDto().getId())
                        .param("maxWeightKg", "90"))
                .andExpect(status().isOk());

        ExerciseMaxWeight stored =
                exerciseMaxWeightDao.findByUserIdAndExerciseId(user.getUserDto().getId(), ex.getId());

        assert(stored.getMaxWeightKg() == 90.0);
    }

    @Test
    void testGetRanking_ReturnsUserOnly() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("u3@test.com", User.RoleType.CLIENT);
        Exercise ex = createExercise("ex3");

        exerciseMaxWeightService.addOrUpdateMaxWeight(user.getUserDto().getId(), ex.getId(), (short) 40);

        mockMvc.perform(get("/api/exercises/" + ex.getId() + "/maxWeight/ranking")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .requestAttr("userId", user.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userName").value(user.getUserDto().getName()))
                .andExpect(jsonPath("$[0].userSurname").value(user.getUserDto().getSurname()))
                .andExpect(jsonPath("$[0].maxWeightKg").value(40));
    }

    @Test
    void testGetRanking_UserNotFound_NoRecord() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("u4@test.com", User.RoleType.CLIENT);
        Exercise ex = createExercise("ex4");

        mockMvc.perform(get("/api/exercises/" + ex.getId() + "/maxWeight/ranking")
                        .header("Authorization", "Bearer " + user.getServiceToken())
                        .requestAttr("userId", user.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }
}
