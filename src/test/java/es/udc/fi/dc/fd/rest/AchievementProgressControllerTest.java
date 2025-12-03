package es.udc.fi.dc.fd.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.udc.fi.dc.fd.model.entities.*;
import es.udc.fi.dc.fd.model.entities.User.RoleType;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressParamsDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.OnFinishWorkoutParamsDto;
import es.udc.fi.dc.fd.model.services.exceptions.BlockedUserException;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AchievementProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private AchievementDao achievementDao;

    @Autowired
    private AchievementProgressDao achievementProgressDao;

    @Autowired
    private UserController userController;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private AuthenticatedUserDto userA;
    private AuthenticatedUserDto userB;

    private Achievement hours;
    private Achievement reps;
    private Achievement sessions;

    private AuthenticatedUserDto createAuthenticatedUser(String name, String email)
            throws IncorrectLoginException, BlockedUserException {

        User u = new User(name, name, email, "600000000", "pass",
                RoleType.CLIENT, User.StatusType.ACTIVE);
        u.setPassword(passwordEncoder.encode("pass"));
        userDao.save(u);

        LoginParamsDto params = new LoginParamsDto();
        params.setEmail(email);
        params.setPassword("pass");

        return userController.login(params);
    }

    @BeforeEach
    void setUp() throws IncorrectLoginException, BlockedUserException {
        userA = createAuthenticatedUser("UserA", "userA@test.com");
        userB = createAuthenticatedUser("UserB", "userB@test.com");

        // Recuperar achievements ya insertados por la aplicación
        hours = achievementDao.findById(1L).orElseThrow();
        reps = achievementDao.findById(2L).orElseThrow();
        sessions = achievementDao.findById(3L).orElseThrow();
    }

    @Test
    void testCreateOrUpdateAchievementProgress() throws Exception {

        AchievementProgressParamsDto params = new AchievementProgressParamsDto();
        params.setProgress(15);

        mockMvc.perform(post("/api/achievements/" + hours.getId() + "/progress")
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isOk());

        assertNotNull(
                achievementProgressDao.findByUserIdAndAchievementId(
                        userA.getUserDto().getId(), hours.getId()));
    }

    @Test
    void testOnFinishWorkoutCreatesOrUpdatesProgresses() throws Exception {

        OnFinishWorkoutParamsDto params = new OnFinishWorkoutParamsDto();
        params.setSeconds(3600);
        params.setReps(50);

        mockMvc.perform(post("/api/achievements/onFinishWorkout")
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isOk());

        assertEquals(3600,
                achievementProgressDao.findByUserIdAndAchievementId(
                        userA.getUserDto().getId(), hours.getId()).getProgress());

        assertEquals(50,
                achievementProgressDao.findByUserIdAndAchievementId(
                        userA.getUserDto().getId(), reps.getId()).getProgress());

        assertEquals(1,
                achievementProgressDao.findByUserIdAndAchievementId(
                        userA.getUserDto().getId(), sessions.getId()).getProgress());
    }

    @Test
    void testOnFinishWorkoutUnauthorizedFails() throws Exception {
        OnFinishWorkoutParamsDto params = new OnFinishWorkoutParamsDto();
        params.setSeconds(100);
        params.setReps(10);

        mockMvc.perform(post("/api/achievements/onFinishWorkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testOnFinishWorkoutUpdatesExistingProgress() throws Exception {

        achievementProgressDao.save(
                new AchievementProgress(100,
                        userDao.findById(userA.getUserDto().getId()).get(), hours));

        achievementProgressDao.save(
                new AchievementProgress(20,
                        userDao.findById(userA.getUserDto().getId()).get(), reps));

        OnFinishWorkoutParamsDto params = new OnFinishWorkoutParamsDto();
        params.setSeconds(3600);
        params.setReps(50);

        mockMvc.perform(post("/api/achievements/onFinishWorkout")
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isOk());

        assertEquals(3700,
                achievementProgressDao.findByUserIdAndAchievementId(
                        userA.getUserDto().getId(), hours.getId()).getProgress());

        assertEquals(70,
                achievementProgressDao.findByUserIdAndAchievementId(
                        userA.getUserDto().getId(), reps.getId()).getProgress());
    }

    @Test
    void testFindAchievementProgress() throws Exception {

        AchievementProgressParamsDto params = new AchievementProgressParamsDto();
        params.setProgress(12);

        mockMvc.perform(post("/api/achievements/" + reps.getId() + "/progress")
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/achievements/" + reps.getId())
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(reps.getName()))
                .andExpect(jsonPath("$.description").value(reps.getDescription()))
                .andExpect(jsonPath("$.progress").value(12))
                .andExpect(jsonPath("$.bronzeReq").value(reps.getBronzeReq()))
                .andExpect(jsonPath("$.silverReq").value(reps.getSilverReq()))
                .andExpect(jsonPath("$.goldReq").value(reps.getGoldReq()));
    }

    @Test
    void testFindAllAchievementProgressesByUser() throws Exception {

        AchievementProgressParamsDto params = new AchievementProgressParamsDto();
        params.setProgress(7);

        mockMvc.perform(post("/api/achievements/" + hours.getId() + "/progress")
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/achievements/user/" + userA.getUserDto().getId())
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[1].name").exists());
    }

    @Test
    void testFindAllAchievementProgressesForOtherUser() throws Exception {

        AchievementProgressParamsDto params = new AchievementProgressParamsDto();
        params.setProgress(50);

        mockMvc.perform(post("/api/achievements/" + hours.getId() + "/progress")
                        .header("Authorization", "Bearer " + userB.getServiceToken())
                        .requestAttr("userId", userB.getUserDto().getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isOk());

        //user a accesses user b's achievements
        mockMvc.perform(get("/api/achievements/user/" + userB.getUserDto().getId())
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].progress").value(50));
    }

    @Test
    void testFindAchievementProgressUnknownAchievementFails() throws Exception {
        mockMvc.perform(get("/api/achievements/99999")
                        .header("Authorization", "Bearer " + userA.getServiceToken())
                        .requestAttr("userId", userA.getUserDto().getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetProgressesUnauthorizedFails() throws Exception {
        mockMvc.perform(get("/api/achievements"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreateProgressUnauthorizedFails() throws Exception {
        AchievementProgressParamsDto params = new AchievementProgressParamsDto();
        params.setProgress(9);

        mockMvc.perform(post("/api/achievements/" + hours.getId() + "/progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(params)))
                .andExpect(status().isForbidden());
    }
}
